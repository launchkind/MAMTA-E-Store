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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useToast } from "@/hooks/use-toast";

import * as XLSX from "xlsx";
import Papa from "papaparse";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";

interface CategoryBulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentCategories: { _id: string; name: string }[];
  onSuccess: () => void;
}

interface ParsedCategory {
  name: string;
  categoryType: string[];
  parent: string;
  order: number;
  description: string;
  errors: string[];
  warnings: string[];
  rowIndex: number;
}

interface MissingParent {
  name: string;
  categoryType: string[];
  order: number;
  description: string;
}

type Step = "upload" | "verify" | "adjust" | "approve";

export function CategoryBulkUploadModal({
  open,
  onOpenChange,
  parentCategories,
  onSuccess,
}: CategoryBulkUploadModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsedCategories, setParsedCategories] = useState<ParsedCategory[]>(
    [],
  );
  const [missingParents, setMissingParents] = useState<
    Map<string, MissingParent>
  >(new Map());
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

  // Validate category data
  const validateCategory = (
    category: Record<string, unknown>,
    rowIndex: number,
  ): ParsedCategory => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const name = String(category.name || "");
    const categoryTypeStr = String(category.categoryType || "Featured");
    const categoryType = categoryTypeStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (categoryType.length === 0) categoryType.push("Featured");

    const parent = String(category.parent || "");
    const order = Number(category.order || 0);
    const description = String(category.description || "");

    // Required fields validation
    if (!name || name.trim() === "") {
      errors.push("Name is required");
    }

    // Validate categoryType
    const validTypes = ["Featured", "Hot Categories", "Top Categories"];
    const invalidTypes = categoryType.filter(
      (type) => !validTypes.includes(type),
    );
    if (invalidTypes.length > 0) {
      errors.push(`Category types must be one of: ${validTypes.join(", ")}`);
    }

    // Check if parent exists if provided
    if (parent && parent.trim() !== "") {
      const parentExists = parentCategories.find(
        (c) => c.name.toLowerCase() === parent.toLowerCase(),
      );
      if (!parentExists) {
        warnings.push(
          `Parent category "${parent}" not found - will create option available`,
        );
      }
    }

    return {
      name,
      categoryType,
      parent,
      order,
      description,
      errors,
      warnings,
      rowIndex,
    };
  };

  // Parse uploaded file
  const parseFile = (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension === "csv") {
      parseCSV(file);
    } else if (["xlsx", "xls"].includes(fileExtension || "")) {
      parseExcel(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file.",
      });
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = (results.data as Record<string, unknown>[]).map(
          (row, index) => validateCategory(row, index + 2),
        );
        setParsedCategories(parsed);
        setStep("verify");
      },
      error: () => {
        toast({
          variant: "destructive",
          title: "Parse error",
          description: "Failed to parse CSV file.",
        });
      },
    });
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as Record<
          string,
          unknown
        >[];

        const parsed = json.map((row, index) =>
          validateCategory(row, index + 2),
        );
        setParsedCategories(parsed);
        setStep("verify");
      } catch {
        toast({
          variant: "destructive",
          title: "Parse error",
          description: "Failed to parse Excel file.",
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        name: "Example Category",
        categoryType: "Featured",
        parent: "Parent Category Name",
        order: 0,
        description: "Category description",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
    XLSX.writeFile(workbook, "category_upload_template.xlsx");
  };

  // Identify missing parent categories
  const identifyMissingParents = () => {
    const missing = new Map<string, MissingParent>();

    parsedCategories.forEach((cat) => {
      if (cat.parent && cat.parent.trim() !== "") {
        const parentExists = parentCategories.find(
          (p) => p.name.toLowerCase() === cat.parent.toLowerCase(),
        );

        if (!parentExists && !missing.has(cat.parent.toLowerCase())) {
          missing.set(cat.parent.toLowerCase(), {
            name: cat.parent,
            categoryType: ["Featured"],
            order: 0,
            description: `Auto-created parent category for ${cat.name}`,
          });
        }
      }
    });

    setMissingParents(missing);
  };

  const handleProceedToAdjust = () => {
    identifyMissingParents();
    setStep("adjust");
  };

  const updateMissingParent = (
    parentName: string,
    field: keyof MissingParent,
    value: string | number | string[],
  ) => {
    setMissingParents((prev) => {
      const newMap = new Map(prev);
      const parent = newMap.get(parentName.toLowerCase());
      if (parent) {
        newMap.set(parentName.toLowerCase(), { ...parent, [field]: value });
      }
      return newMap;
    });
  };

  const handleUpload = async () => {
    const validCategories = parsedCategories.filter(
      (c) => c.errors.length === 0,
    );

    if (validCategories.length === 0) {
      toast({
        variant: "destructive",
        title: "No valid categories",
        description: "Please fix all errors before uploading.",
      });
      return;
    }

    setUploading(true);
    try {
      // First, create missing parent categories
      const createdParents = new Map<string, string>();

      const { supabase } = await import("@/lib/supabase");

      if (missingParents.size > 0) {
        for (const [key, parent] of missingParents.entries()) {
          try {
            const { data: newParent, error: parentError } = await supabase
              .from("categories")
              .insert({ name: parent.name, description: parent.description, category_type: parent.categoryType ? [parent.categoryType] : [], sort_order: parent.order ?? 0, is_active: true })
              .select("id").single();
            if (parentError) throw parentError;
            createdParents.set(key, newParent.id);
          } catch (error) {
            console.error(`Failed to create parent: ${parent.name}`, error);
            throw new Error(`Failed to create parent category: ${parent.name}`);
          }
        }
      }

      // Map parent names to IDs (including newly created ones)
      const categoriesToUpload = validCategories.map((cat) => {
        let parentId = null;

        if (cat.parent && cat.parent.trim() !== "") {
          const createdParentId = createdParents.get(cat.parent.toLowerCase());
          if (createdParentId) {
            parentId = createdParentId;
          } else {
            const parentCat = parentCategories.find(
              (p) => p.name.toLowerCase() === cat.parent.toLowerCase(),
            );
            parentId = parentCat?._id || null;
          }
        }

        return {
          name: cat.name,
          category_type: cat.categoryType ? [cat.categoryType] : [],
          parent_id: parentId,
          sort_order: cat.order ?? 0,
          description: cat.description,
          is_active: true,
        };
      });

      const { error: bulkCatError } = await supabase.from("categories").insert(categoriesToUpload);
      if (bulkCatError) throw bulkCatError;

      const successMessage =
        missingParents.size > 0
          ? `${missingParents.size} parent categories and ${validCategories.length} categories uploaded successfully.`
          : `${validCategories.length} categories uploaded successfully.`;

      toast({
        title: "Success",
        description: successMessage,
      });

      onSuccess();
      handleClose();
    } catch (error: unknown) {
      console.error("Bulk upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload categories. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setStep("upload");
    setFile(null);
    setParsedCategories([]);
    setMissingParents(new Map());
    onOpenChange(false);
  };

  const validCount = parsedCategories.filter(
    (c) => c.errors.length === 0,
  ).length;
  const errorCount = parsedCategories.filter((c) => c.errors.length > 0).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Categories</DialogTitle>
          <DialogDescription>
            Upload multiple categories at once using Excel or CSV files
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, index) => (
            <div key={s.key} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  index <= currentStepIndex
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <span className="font-medium">{s.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    index < currentStepIndex ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Upload Step */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload File</h3>
              <p className="text-gray-600 mb-4">
                Select an Excel (.xlsx, .xls) or CSV file to upload
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              {file && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Template Format
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Your file should include the following columns:
              </p>
              <ul className="text-sm text-blue-800 space-y-1 mb-3">
                <li>
                  • <strong>name</strong> (required): Category name
                </li>
                <li>
                  • <strong>categoryType</strong>: Featured, Hot Categories, or
                  Top Categories
                </li>
                <li>
                  • <strong>parent</strong>: Parent category name (leave empty
                  for root categories)
                </li>
                <li>
                  • <strong>order</strong>: Display order (number)
                </li>
                <li>
                  • <strong>description</strong>: Category description
                </li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>
        )}

        {/* Verify Step */}
        {step === "verify" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">{validCount} Valid</span>
                </div>
                {errorCount > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-600">
                      {errorCount} Errors
                    </span>
                  </div>
                )}
                {parsedCategories.some((c) => c.warnings.length > 0) && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-600">
                      {
                        parsedCategories.filter((c) => c.warnings.length > 0)
                          .length
                      }{" "}
                      Warnings
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("upload")}>
                  Back
                </Button>
                <Button
                  onClick={handleProceedToAdjust}
                  disabled={validCount === 0}
                >
                  Continue
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedCategories.map((cat, index) => (
                    <TableRow
                      key={index}
                      className={
                        cat.errors.length > 0
                          ? "bg-red-50"
                          : cat.warnings.length > 0
                            ? "bg-yellow-50"
                            : ""
                      }
                    >
                      <TableCell>{cat.rowIndex}</TableCell>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>{cat.categoryType.join(", ")}</TableCell>
                      <TableCell>{cat.parent || "-"}</TableCell>
                      <TableCell>{cat.order}</TableCell>
                      <TableCell>
                        {cat.errors.length === 0 &&
                        cat.warnings.length === 0 ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Valid
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {cat.errors.map((error, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-red-600 text-sm"
                              >
                                <AlertCircle className="h-4 w-4" />
                                {error}
                              </div>
                            ))}
                            {cat.warnings.map((warning, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-yellow-600 text-sm"
                              >
                                <AlertCircle className="h-4 w-4" />
                                {warning}
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Adjust Step - Handle Missing Parents */}
        {step === "adjust" && (
          <div className="space-y-4">
            {missingParents.size > 0 ? (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">
                        Missing Parent Categories Found
                      </h4>
                      <p className="text-sm text-yellow-800">
                        The following parent categories don't exist. Review and
                        adjust the details below. They will be created
                        automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parent Name</TableHead>
                        <TableHead>Category Type</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from(missingParents.entries()).map(
                        ([key, parent]) => (
                          <TableRow key={key}>
                            <TableCell className="font-medium">
                              {parent.name}
                            </TableCell>
                            <TableCell>
                              <Input
                                value={parent.categoryType.join(", ")}
                                onChange={(e) =>
                                  updateMissingParent(
                                    parent.name,
                                    "categoryType",
                                    e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  )
                                }
                                placeholder="Comma separated types"
                                className="w-40"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={parent.order}
                                onChange={(e) =>
                                  updateMissingParent(
                                    parent.name,
                                    "order",
                                    Number(e.target.value),
                                  )
                                }
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={parent.description}
                                onChange={(e) =>
                                  updateMissingParent(
                                    parent.name,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder="Description"
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep("verify")}>
                    Back
                  </Button>
                  <Button onClick={() => setStep("approve")}>
                    Continue to Approve
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">
                        All Parent Categories Exist
                      </h4>
                      <p className="text-sm text-green-800">
                        No missing parent categories found. You can proceed to
                        upload.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep("verify")}>
                    Back
                  </Button>
                  <Button onClick={() => setStep("approve")}>
                    Continue to Approve
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Approve Step */}
        {step === "approve" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="text-center mb-4">
                <CheckCircle className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to Upload</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Categories to create:</span>
                  <span className="font-bold text-blue-600">{validCount}</span>
                </div>

                {missingParents.size > 0 && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-700">
                      Parent categories to create:
                    </span>
                    <span className="font-bold text-green-600">
                      {missingParents.size}
                    </span>
                  </div>
                )}

                {errorCount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-700">
                      Categories with errors (skipped):
                    </span>
                    <span className="font-bold text-red-600">{errorCount}</span>
                  </div>
                )}
              </div>

              {missingParents.size > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Missing parent categories will be
                    created first, then subcategories will be assigned to them.
                  </p>
                  <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                    {Array.from(missingParents.values()).map((parent, idx) => (
                      <li key={idx}>{parent.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep("adjust")}>
                Back
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {validCount} Categories
                    {missingParents.size > 0 &&
                      ` + ${missingParents.size} Parents`}
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
