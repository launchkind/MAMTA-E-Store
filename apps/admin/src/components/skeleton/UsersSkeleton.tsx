import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const UsersSkeleton = ({ isAdmin }: { isAdmin: boolean }) => (
  <div className="rounded-xl border border-gray-200 shadow-md overflow-hidden bg-white">
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="w-[80px] font-semibold text-gray-700">
            Avatar
          </TableHead>
          <TableHead className="font-semibold text-gray-700">Name</TableHead>
          <TableHead className="font-semibold text-gray-700">Email</TableHead>
          <TableHead className="font-semibold text-gray-700">Role</TableHead>
          <TableHead className="font-semibold text-gray-700">
            Created At
          </TableHead>
          {isAdmin && (
            <TableHead className="text-right font-semibold text-gray-700">
              Actions
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(8)].map((_, index) => (
          <TableRow key={index} className="border-b border-gray-100">
            <TableCell>
              <div className="h-12 w-12 rounded-full bg-linear-to-r from-gray-200 to-gray-300 animate-pulse"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-3/4 bg-linear-to-r from-gray-200 to-gray-300 animate-pulse rounded-sm"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-2/3 bg-linear-to-r from-gray-200 to-gray-300 animate-pulse rounded-sm"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-1/2 bg-linear-to-r from-gray-200 to-gray-300 animate-pulse rounded-sm"></div>
            </TableCell>
            <TableCell>
              <div className="h-4 w-1/2 bg-linear-to-r from-gray-200 to-gray-300 animate-pulse rounded-sm"></div>
            </TableCell>
            {isAdmin && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <div className="h-8 w-8 bg-linear-to-r from-gray-200 to-gray-300 animate-pulse rounded-full"></div>
                  <div className="h-8 w-8 bg-linear-to-r from-gray-200 to-gray-300 animate-pulse rounded-full"></div>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default UsersSkeleton;
