import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import * as XLSX from "xlsx";
import Papa from "papaparse";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  X,
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { _id: string; name: string }[];
  brands: { _id: string; name: string }[];
  onSuccess: () => void;
}

interface ParsedProduct {
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  category: string;
  brand: string;
  images: string[];
  productType?: string;
  errors: string[];
  rowIndex: number;
}

type Step = "upload" | "verify" | "adjust" | "approve";

export function BulkUploadModal({
  open,
  onOpenChange,
  categories,
  brands,
  onSuccess,
}: BulkUploadModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const steps: { key: Step; label: string; icon: typeof Upload }[] = [
    { key: "upload", label: "Upload File", icon: Upload },
    { key: "verify", label: "Verify Data", icon: CheckCircle },
    { key: "adjust", label: "Adjust & Fix", icon: AlertCircle },
    { key: "approve", label: "Approve & Upload", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  // Validate product data
  const validateProduct = (
    product: Record<string, unknown>,
    rowIndex: number
  ): ParsedProduct => {
    const errors: string[] = [];

    const name = String(product.name || "");
    const description = String(product.description || "");
    const category = String(product.category || "");
    const brand = String(product.brand || "");

    // Required fields validation
    if (!name || name.trim() === "") {
      errors.push("Name is required");
    }
    if (!description || description.trim() === "") {
      errors.push("Description is required");
    }
    if (
      !product.price ||
      isNaN(Number(product.price)) ||
      Number(product.price) <= 0
    ) {
      errors.push("Valid price is required");
    }
    if (
      product.discountPercentage === undefined ||
      isNaN(Number(product.discountPercentage))
    ) {
      errors.push("Discount percentage is required");
    }
    if (
      !product.stock ||
      isNaN(Number(product.stock)) ||
      Number(product.stock) < 0
    ) {
      errors.push("Valid stock is required");
    }
    if (!category || category.trim() === "") {
      errors.push("Category is required");
    }
    if (!brand || brand.trim() === "") {
      errors.push("Brand is required");
    }

    // Validate category exists
    const categoryExists = categories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase()
    );
    if (category && !categoryExists) {
      errors.push(`Category "${category}" not found`);
    }

    // Validate brand exists
    const brandExists = brands.find(
      (b) => b.name.toLowerCase() === brand.toLowerCase()
    );
    if (brand && !brandExists) {
      errors.push(`Brand "${brand}" not found`);
    }

    // Parse images (image URLs separated by comma or semicolon)
    let images: string[] = [];
    if (product.images) {
      const imageString = String(product.images);
      images = imageString
        .split(/[,;]/)
        .map((url) => url.trim())
        .filter((url) => url.length > 0);
    }

    return {
      name: name,
      description: description,
      price: Number(product.price) || 0,
      discountPercentage: Number(product.discountPercentage) || 0,
      stock: Number(product.stock) || 0,
      category: category,
      brand: brand,
      images: images,
      productType: String(product.productType || "base"),
      errors,
      rowIndex,
    };
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.match(/\.(xlsx|xls|csv)$/)
    ) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV (.csv) file",
      });
      return;
    }

    setFile(selectedFile);
  };

  // Parse file
  const handleParseFile = async () => {
    if (!file) return;

    try {
      setUploading(true);

      if (file.name.endsWith(".csv")) {
        // Parse CSV
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const validated = (results.data as Record<string, unknown>[]).map(
              (row, index) => validateProduct(row, index + 2)
            );
            setParsedProducts(validated);
            setStep("verify");
            setUploading(false);
          },
          error: () => {
            toast({
              variant: "destructive",
              title: "Parse Error",
              description: "Failed to parse CSV file",
            });
            setUploading(false);
          },
        });
      } else {
        // Parse Excel
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet) as Record<
              string,
              unknown
            >[];

            const validated = json.map((row, index) =>
              validateProduct(row, index + 2)
            );
            setParsedProducts(validated);
            setStep("verify");
            setUploading(false);
          } catch {
            toast({
              variant: "destructive",
              title: "Parse Error",
              description: "Failed to parse Excel file",
            });
            setUploading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to parse file",
      });
      setUploading(false);
    }
  };

  // Update product field
  const updateProduct = (
    index: number,
    field: keyof ParsedProduct,
    value: string | number | string[]
  ) => {
    const updated = [...parsedProducts];
    updated[index] = { ...updated[index], [field]: value };

    // Re-validate
    updated[index] = validateProduct(
      updated[index] as unknown as Record<string, unknown>,
      updated[index].rowIndex
    );
    setParsedProducts(updated);
  };

  // Remove product
  const removeProduct = (index: number) => {
    setParsedProducts(parsedProducts.filter((_, i) => i !== index));
  };

  // Upload products to API
  const handleUploadProducts = async () => {
    try {
      setUploading(true);

      // Filter out products with errors
      const validProducts = parsedProducts.filter((p) => p.errors.length === 0);

      if (validProducts.length === 0) {
        toast({
          variant: "destructive",
          title: "No Valid Products",
          description: "Please fix all errors before uploading",
        });
        setUploading(false);
        return;
      }

      // Transform products for API
      const productsToUpload = validProducts.map((p) => ({
        name: p.name,
        description: p.description,
        price: p.price,
        discountPercentage: p.discountPercentage,
        stock: p.stock,
        category: categories.find(
          (c) => c.name.toLowerCase() === p.category.toLowerCase()
        )?._id,
        brand: brands.find(
          (b) => b.name.toLowerCase() === p.brand.toLowerCase()
        )?._id,
        images: p.images,
        productType: p.productType,
      }));

      const { supabase } = await import("@/lib/supabase");
      const inserts = productsToUpload.map((p) => ({
        name: p.name,
        description: p.description,
        price: p.price,
        discount_percentage: p.discountPercentage ?? 0,
        stock: p.stock ?? 0,
        image: (p.images && p.images[0]) ?? "",
        images: p.images ?? [],
        category_id: p.category ?? null,
        brand_id: p.brand ?? null,
        approval_status: "pending",
      }));
      const { error: bulkError } = await supabase.from("products").insert(inserts);
      if (bulkError) throw bulkError;

      toast({
        title: "Success",
        description: `Successfully uploaded ${validProducts.length} products`,
      });

      // Reset and close
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload products";
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  // Download template
  const handleDownloadTemplate = () => {
    const template = [
      {
        name: "Sample Product 1",
        description: "This is a sample product description",
        price: 99.99,
        discountPercentage: 10,
        stock: 50,
        category: "Electronics",
        brand: "Samsung",
        images: "https://example.com/image1.jpg,https://example.com/image2.jpg",
        productType: "featured",
      },
      {
        name: "Sample Product 2",
        description: "Another sample product",
        price: 149.99,
        discountPercentage: 15,
        stock: 30,
        category: "Fashion",
        brand: "Nike",
        images: "https://example.com/image3.jpg",
        productType: "trending",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "product_upload_template.xlsx");

    toast({
      title: "Template Downloaded",
      description: "Check your downloads folder for the template file",
    });
  };

  // Handle close
  const handleClose = () => {
    setStep("upload");
    setFile(null);
    setParsedProducts([]);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  const validProductCount = parsedProducts.filter(
    (p) => p.errors.length === 0
  ).length;
  const errorProductCount = parsedProducts.filter(
    (p) => p.errors.length > 0
  ).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            Bulk Upload Products
          </DialogTitle>
          <DialogDescription>
            Upload multiple products at once using Excel or CSV file
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = s.key === step;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={s.key} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p
                    className={`text-xs sm:text-sm font-medium mt-2 text-center ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mx-1 sm:mx-2 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-8 sm:p-12 text-center space-y-4">
              <div className="flex justify-center">
                <FileSpreadsheet className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Upload Your Product File
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: Excel (.xlsx, .xls) or CSV (.csv)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Label
                  htmlFor="bulk-file"
                  className="cursor-pointer inline-block"
                >
                  <div className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
                    Choose File
                  </div>
                  <Input
                    id="bulk-file"
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </Label>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>

              {file && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium">Selected: {file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                Template Format Guide
              </h4>
              <ul className="text-xs sm:text-sm space-y-1 text-muted-foreground list-disc list-inside">
                <li>
                  <strong>Required:</strong> name, description, price,
                  discountPercentage, stock, category, brand
                </li>
                <li>
                  <strong>Optional:</strong> images (comma-separated URLs),
                  productType
                </li>
                <li>Category and Brand names must match existing entries</li>
                <li>Images can be added later if not provided</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleParseFile} disabled={!file || uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Verify */}
        {step === "verify" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-card border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{parsedProducts.length}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-400">
                  Valid Products
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {validProductCount}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-400">
                  Errors Found
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {errorProductCount}
                </p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedProducts.map((product, index) => (
                    <TableRow
                      key={index}
                      className={
                        product.errors.length > 0
                          ? "bg-red-50 dark:bg-red-950/10"
                          : ""
                      }
                    >
                      <TableCell className="font-medium">
                        {product.rowIndex}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {product.name}
                      </TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>
                        {product.errors.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {product.errors.length} error(s)
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep("adjust")}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Adjust */}
        {step === "adjust" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review and fix any errors before uploading. You can edit fields
              directly or remove invalid rows.
            </p>

            <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[100px]">Price</TableHead>
                    <TableHead className="min-w-20">Discount%</TableHead>
                    <TableHead className="min-w-20">Stock</TableHead>
                    <TableHead className="min-w-[120px]">Category</TableHead>
                    <TableHead className="min-w-[120px]">Brand</TableHead>
                    <TableHead className="min-w-[150px]">Errors</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedProducts.map((product, index) => (
                    <TableRow
                      key={index}
                      className={
                        product.errors.length > 0
                          ? "bg-red-50 dark:bg-red-950/10"
                          : ""
                      }
                    >
                      <TableCell>{product.rowIndex}</TableCell>
                      <TableCell>
                        <Input
                          value={product.name}
                          onChange={(e) =>
                            updateProduct(index, "name", e.target.value)
                          }
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={product.price}
                          onChange={(e) =>
                            updateProduct(
                              index,
                              "price",
                              Number(e.target.value)
                            )
                          }
                          className="min-w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={product.discountPercentage}
                          onChange={(e) =>
                            updateProduct(
                              index,
                              "discountPercentage",
                              Number(e.target.value)
                            )
                          }
                          className="min-w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={product.stock}
                          onChange={(e) =>
                            updateProduct(
                              index,
                              "stock",
                              Number(e.target.value)
                            )
                          }
                          className="min-w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={product.category}
                          onValueChange={(value) =>
                            updateProduct(index, "category", value)
                          }
                        >
                          <SelectTrigger className="min-w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat._id} value={cat.name}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={product.brand}
                          onValueChange={(value) =>
                            updateProduct(index, "brand", value)
                          }
                        >
                          <SelectTrigger className="min-w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand._id} value={brand.name}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {product.errors.length > 0 ? (
                          <div className="text-xs text-red-600 space-y-1 min-w-[150px]">
                            {product.errors.map((error, i) => (
                              <div key={i}>• {error}</div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-green-600 text-xs">
                            ✓ Valid
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProduct(index)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep("verify")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep("approve")}
                disabled={validProductCount === 0}
              >
                Continue to Approve
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Approve */}
        {step === "approve" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to Upload</h3>
                <p className="text-muted-foreground">
                  {validProductCount} product(s) are ready to be uploaded to
                  your store
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-6 space-y-4 bg-muted/30">
              <h4 className="font-semibold">Upload Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold">{parsedProducts.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Valid Products
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {validProductCount}
                  </p>
                </div>
                {errorProductCount > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm text-red-600">
                      {errorProductCount} product(s) with errors will be skipped
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
              <p className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                Important Notes
              </p>
              <ul className="text-xs sm:text-sm mt-2 space-y-1 text-muted-foreground list-disc list-inside">
                <li>
                  Products without image URLs will be created with placeholder
                  images
                </li>
                <li>You can add product images later from the products page</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("adjust")}
                disabled={uploading}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleUploadProducts}
                disabled={uploading || validProductCount === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {validProductCount} Product(s)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
