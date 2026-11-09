// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Card, CardContent } from "../../components/ui/card";
// import { Button } from "../../components/ui/button";
// import { Input } from "../../components/ui/input";
// import { Label } from "../../components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../../components/ui/dialog";
// import {
//   useCustomers,
//   useCreateCustomer,
//   useCustomerBookings,
// } from "../../hooks/useCustomer";
// import {
//   Plus,
//   Search,
//   Phone,
//   Mail,
//   User,
//   History,
//   MapPin,
//   CreditCard,
//   FileImage,
//   Eye,
// } from "lucide-react";
// import { Badge } from "../../components/ui/badge";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "../../components/ui/tabs";
// import { ScrollArea } from "../../components/ui/scroll-area";

// const initialFormData = {
//   name: "",
//   phone: "",
//   email: "",
//   id_proof_type: "",
//   id_proof_number: "",
//   address: "",
// };

// function CustomerBookingsPanel({ customerId }) {
//   const { data: bookings, isLoading } = useCustomerBookings(customerId);

//   if (isLoading) return <p className="text-gray-500">Loading...</p>;

//   return (
//     <div className="space-y-2 max-h-60 overflow-y-auto">
//       {bookings?.map((booking) => (
//         <div
//           key={booking._id}
//           className="p-3 bg-black-50 rounded-lg flex items-center justify-between"
//         >
//           <div>
//             <p className="font-medium">{booking.bikes?.model}</p>
//             <p className="text-sm text-gray-500">
//               {format(new Date(booking.start_datetime), "MMM d, yyyy HH:mm")} -{" "}
//               {format(new Date(booking.end_datetime), "MMM d, yyyy HH:mm")}
//             </p>
//           </div>
//           <Badge variant="outline">{booking.status}</Badge>
//         </div>
//       ))}
//       {bookings?.length === 0 && (
//         <p className="text-gray-500 text-center py-4">No bookings yet</p>
//       )}
//     </div>
//   );
// }

// function DocumentImageViewer({ url, label }) {
//   const [isOpen, setIsOpen] = useState(false);

//   if (!url) {
//     return (
//       <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg text-gray-500">
//         <FileImage className="w-5 h-5" />
//         <span>{label} not uploaded</span>
//       </div>
//     );
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
//           <FileImage className="w-5 h-5 text-primary" />
//           <span className="text-primary font-medium">{label}</span>
//           <Eye className="w-4 h-4 ml-auto text-primary" />
//         </div>
//       </DialogTrigger>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>{label}</DialogTitle>
//         </DialogHeader>
//         <div className="mt-4">
//           <img
//             src={url}
//             alt={label}
//             className="w-full h-auto rounded-lg border"
//             onError={(e) => {
//               e.target.src = "/placeholder.svg";
//             }}
//           />
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default function Customers() {
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [viewingCustomer, setViewingCustomer] = useState(null);
//   const [formData, setFormData] = useState(initialFormData);
//   const [searchQuery, setSearchQuery] = useState("");

//   const [currentPage, setCurrentPage] = useState(1);
//   const ITEMS_PER_PAGE = 24;

//   const { data: customers, isLoading } = useCustomers(searchQuery);
//   const createCustomer = useCreateCustomer();

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//     setCurrentPage(1);
//   };
//   const totalPages = Math.ceil((customers?.length || 0) / ITEMS_PER_PAGE) || 1;
//   const paginatedCustomers = customers?.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE
//   );

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.name || !formData.phone) {
//       toast.error("Please fill in name and phone");
//       return;
//     }

//     await createCustomer.mutateAsync(formData);
//     setIsAddOpen(false);
//     setFormData(initialFormData);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-display text-gradient-sunset">
//             Customers
//           </h1>
//           {/* <p className="text-muted-foreground">View Customer Data</p> */}
//           <p className="text-muted-foreground">
//             View Customer Data {customers ? `(${customers.length} total)` : ""}
//           </p>
//         </div>
//       </div>

//       <div className="relative max-w-md">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//         <Input
//           placeholder="Search by name, phone, or email..."
//           value={searchQuery}
//           // onChange={(e) => setSearchQuery(e.target.value)}
          
//           className="pl-10"
//         />
//       </div>

//       {isLoading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {[1, 2, 3].map((i) => (
//             <Card key={i} className="animate-pulse">
//               <CardContent className="p-4 space-y-2">
//                 <div className="h-4 bg-gray-200 rounded w-3/4" />
//                 <div className="h-3 bg-gray-200 rounded w-1/2" />
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {customers?.map((customer, index) => (
//             <motion.div
//               key={customer._id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.05 }}
//             >
//               <Card
//                 className="hover:shadow-md transition-shadow cursor-pointer"
//                 onClick={() => setViewingCustomer(customer)}
//               >
//                 <CardContent className="p-4">
//                   <div className="flex items-start justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-primary/10 rounded-full">
//                         <User className="w-5 h-5 text-primary" />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold">{customer.name}</h3>
//                         <div className="flex items-center gap-1 text-sm text-gray-600">
//                           <Phone className="w-3 h-3" />
//                           {customer.phone}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {customer.email && (
//                     <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
//                       <Mail className="w-3 h-3" />
//                       {customer.email}
//                     </div>
//                   )}

//                   {customer.id_proof_type && (
//                     <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
//                       <CreditCard className="w-3 h-3" />
//                       {customer.id_proof_type}: {customer.id_proof_number}
//                     </div>
//                   )}

//                   <div className="mt-4 flex gap-2">
//                     <Badge
//                       variant="outline"
//                       className="flex items-center gap-1"
//                     >
//                       <History className="w-3 h-3" />
//                       View Details
//                     </Badge>
//                     {(customer.aadhaar_image_url ||
//                       customer.license_image_url) && (
//                       <Badge
//                         variant="secondary"
//                         className="flex items-center gap-1"
//                       >
//                         <FileImage className="w-3 h-3" />
//                         Documents
//                       </Badge>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))}

//           {customers?.length === 0 && (
//             <div className="col-span-full text-center py-12">
//               <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-500">No customers found</p>
//             </div>
//           )}
//         </div>
//       )}

//       <Dialog
//         open={!!viewingCustomer}
//         onOpenChange={() => setViewingCustomer(null)}
//       >
//         <DialogContent className="max-w-lg max-h-[90vh]">
//           <DialogHeader>
//             <DialogTitle>Customer Details</DialogTitle>
//           </DialogHeader>
//           {viewingCustomer && (
//             <ScrollArea className="max-h-[calc(90vh-8rem)]">
//               <div className="space-y-4 pr-4">
//                 <div className="flex items-center gap-3 p-4 bg-black-50 rounded-lg">
//                   <div className="p-3 bg-primary/10 rounded-full">
//                     <User className="w-8 h-8 text-primary" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-lg">
//                       {viewingCustomer.name}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       {viewingCustomer.phone}
//                     </p>
//                   </div>
//                 </div>

//                 <Tabs defaultValue="details">
//                   <TabsList className="w-full">
//                     <TabsTrigger value="details" className="flex-1">
//                       Details
//                     </TabsTrigger>
//                     <TabsTrigger value="documents" className="flex-1">
//                       Documents
//                     </TabsTrigger>
//                     <TabsTrigger value="bookings" className="flex-1">
//                       Bookings
//                     </TabsTrigger>
//                   </TabsList>

//                   <TabsContent value="details" className="mt-4 space-y-3">
//                     {viewingCustomer.email && (
//                       <div className="flex items-center gap-3 p-3 bg-black-50 rounded-lg">
//                         <Mail className="w-5 h-5 text-gray-400" />
//                         <div>
//                           <p className="text-xs text-gray-500">Email</p>
//                           <p className="font-medium">{viewingCustomer.email}</p>
//                         </div>
//                       </div>
//                     )}

//                     <div className="flex items-center gap-3 p-3 bg-black-50 rounded-lg">
//                       <Phone className="w-5 h-5 text-gray-400" />
//                       <div>
//                         <p className="text-xs text-gray-500">Phone</p>
//                         <p className="font-medium">{viewingCustomer.phone}</p>
//                       </div>
//                     </div>

//                     {viewingCustomer.address && (
//                       <div className="flex items-center gap-3 p-3 bg-black-50 rounded-lg">
//                         <MapPin className="w-5 h-5 text-gray-400" />
//                         <div>
//                           <p className="text-xs text-gray-500">Address</p>
//                           <p className="font-medium">
//                             {viewingCustomer.address}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {viewingCustomer.id_proof_type && (
//                       <div className="flex items-center gap-3 p-3 bg-black-50 rounded-lg">
//                         <CreditCard className="w-5 h-5 text-gray-400" />
//                         <div>
//                           <p className="text-xs text-gray-500">
//                             {viewingCustomer.id_proof_type}
//                           </p>
//                           <p className="font-medium">
//                             {viewingCustomer.id_proof_number}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     <div className="text-sm text-gray-500 pt-2">
//                       Customer since{" "}
//                       {viewingCustomer.createdAt || viewingCustomer.created_at
//                         ? format(
//                             new Date(
//                               viewingCustomer.createdAt ||
//                                 viewingCustomer.created_at,
//                             ),
//                             "MMM d, yyyy",
//                           )
//                         : "N/A"}
//                     </div>
//                   </TabsContent>

//                   {/* <TabsContent value="documents" className="mt-4 space-y-3">
//                     <DocumentImageViewer
//                       url={viewingCustomer.aadhaar_image_url}
//                       label="Aadhaar Card"
//                     />
//                     <DocumentImageViewer
//                       url={viewingCustomer.license_image_url}
//                       label="Driving License"
//                     />

//                     {!viewingCustomer.aadhaar_image_url &&
//                       !viewingCustomer.license_image_url && (
//                         <p className="text-gray-500 text-center py-4">
//                           No documents uploaded
//                         </p>
//                       )}
//                   </TabsContent> */}

//                   <TabsContent value="documents" className="mt-4 space-y-3">
//                     {/* Existing Primary Documents */}
//                     <div className="space-y-3">
//                       <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//                         Primary IDs
//                       </h4>
//                       <DocumentImageViewer
//                         url={viewingCustomer.aadhaar_image_url}
//                         label="Aadhaar Card"
//                       />
//                       <DocumentImageViewer
//                         url={viewingCustomer.license_image_url}
//                         label="Driving License"
//                       />
//                     </div>

//                     {/* New Additional Documents Section */}
//                     {viewingCustomer.extra_documents?.length > 0 && (
//                       <div className="space-y-3 pt-4 border-t border-border">
//                         <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//                           Additional Documents
//                         </h4>
//                         <div className="grid grid-cols-1 gap-2">
//                           {viewingCustomer.extra_documents.map((url, index) => (
//                             <DocumentImageViewer
//                               key={index}
//                               url={url}
//                               label={`Document ${index + 1}`}
//                             />
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {/* Empty State Logic */}
//                     {!viewingCustomer.aadhaar_image_url &&
//                       !viewingCustomer.license_image_url &&
//                       (!viewingCustomer.extra_documents ||
//                         viewingCustomer.extra_documents.length === 0) && (
//                         <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/30 rounded-lg border border-dashed">
//                           <FileImage className="w-10 h-10 text-muted-foreground mb-2 opacity-20" />
//                           <p className="text-sm text-muted-foreground">
//                             No documents uploaded for this customer
//                           </p>
//                         </div>
//                       )}
//                   </TabsContent>

//                   <TabsContent value="bookings" className="mt-4">
//                     <CustomerBookingsPanel customerId={viewingCustomer._id} />
//                   </TabsContent>
//                 </Tabs>
//               </div>
//             </ScrollArea>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  useCustomers,
  useCreateCustomer,
  useCustomerBookings,
} from "../../hooks/useCustomer";
import {
  Plus,
  Search,
  Phone,
  Mail,
  User,
  History,
  MapPin,
  CreditCard,
  FileImage,
  Eye,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useAuth } from "../../lib/AuthProvider";
import { useAdminArea } from "../../lib/AreaContext";

const initialFormData = {
  name: "",
  phone: "",
  email: "",
  id_proof_type: "",
  id_proof_number: "",
  address: "",
};

function CustomerBookingsPanel({ customerId }) {
  const { data: bookings, isLoading } = useCustomerBookings(customerId);

  if (isLoading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {bookings?.map((booking) => (
        <div
          key={booking._id}
          className="p-3 bg-black-50 rounded-lg flex items-center justify-between"
        >
          <div>
            <p className="font-medium">
              {booking.bike_id?.model || booking.bikes?.model || booking.cluster_id?.name || "Rental Vehicle"}
            </p>
            <p className="text-sm text-gray-500">
              {format(new Date(booking.start_datetime), "MMM d, yyyy HH:mm")} -{" "}
              {format(new Date(booking.end_datetime), "MMM d, yyyy HH:mm")}
            </p>
          </div>
          <Badge variant="outline">{booking.status}</Badge>
        </div>
      ))}
      {bookings?.length === 0 && (
        <p className="text-gray-500 text-center py-4">No bookings yet</p>
      )}
    </div>
  );
}

function DocumentImageViewer({ url, label }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!url) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg text-gray-500">
        <FileImage className="w-5 h-5" />
        <span>{label} not uploaded</span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
          <FileImage className="w-5 h-5 text-primary" />
          <span className="text-primary font-medium">{label}</span>
          <Eye className="w-4 h-4 ml-auto text-primary" />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <img
            src={url}
            alt={label}
            loading="lazy"
            decoding="async"
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg border"
            onError={(e) => {
              e.target.src = "/placeholder.svg";
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Customers() {
  const { user } = useAuth();
  const { areas, selectedAreaIds } = useAdminArea();

  const getCustomerAreaName = (cust) => {
    if (!cust) return null;
    if (cust.area_id?.name) return cust.area_id.name;
    const aId = typeof cust.area_id === "object" ? cust.area_id?._id : cust.area_id;
    if (aId && areas && areas.length > 0) {
      const match = areas.find((a) => a._id === aId || String(a._id) === String(aId));
      if (match?.name) return match.name;
    }
    if (cust.area_name) return cust.area_name;
    if (cust.address && cust.address.trim() !== "") return cust.address;
    return null;
  };
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  const { data: customers, isLoading } = useCustomers(searchQuery);
  const createCustomer = useCreateCustomer();

  // Reset to page 1 on search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((customers?.length || 0) / ITEMS_PER_PAGE) || 1;
  const paginatedCustomers = customers?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error("Please fill in name and phone");
      return;
    }

    const assignedAreaId =
      user?.areaId?._id ||
      user?.areaId ||
      user?.assigned_areas?.[0]?._id ||
      user?.assigned_areas?.[0] ||
      null;

    const dataToSend = {
      ...formData,
      ...(assignedAreaId ? { area_id: assignedAreaId } : {}),
    };

    await createCustomer.mutateAsync(dataToSend);
    setIsAddOpen(false);
    setFormData(initialFormData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-gradient-sunset">
            Customers
          </h1>
          <p className="text-muted-foreground">
            View Customer Data {customers ? `(${customers.length} total)` : ""}
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCustomers?.map((customer, index) => (
              <motion.div
                key={customer._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 6) * 0.02 }}
              >
                <Card
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setViewingCustomer(customer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-primary/10 rounded-full shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{customer.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span className="truncate">{customer.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Area / Hub Badge with Dynamic Multi-Area Highlight */}
                      {(() => {
                        const areaName = getCustomerAreaName(customer);
                        if (!areaName) return null;
                        const isMultiArea = selectedAreaIds && selectedAreaIds.length > 1;
                        return (
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold gap-1 px-2.5 py-0.5 rounded-full shadow-sm shrink-0 transition-all ${
                              isMultiArea
                                ? "bg-amber-500/25 text-amber-300 border-amber-500/70 ring-2 ring-amber-500/40 font-bold"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span className="truncate max-w-[100px] sm:max-w-[130px]">{areaName}</span>
                          </Badge>
                        );
                      })()}
                    </div>

                    {customer.email && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </div>
                    )}

                    {customer.id_proof_type && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                        <CreditCard className="w-3 h-3" />
                        {customer.id_proof_type}: {customer.id_proof_number}
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <History className="w-3 h-3" />
                        View Details
                      </Badge>
                      {(customer.aadhaar_image_url ||
                        customer.license_image_url) && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <FileImage className="w-3 h-3" />
                          Documents
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {customers?.length === 0 && (
              <div className="col-span-full text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No customers found</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/60 pt-4 px-1">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, customers?.length || 0)} of{" "}
                {customers?.length || 0} customers
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog
        open={!!viewingCustomer}
        onOpenChange={() => setViewingCustomer(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {viewingCustomer && (
            <ScrollArea className="max-h-[calc(90vh-8rem)]">
              <div className="space-y-4 pr-4">
                <div className="flex items-center gap-3 p-4 bg-black-50 rounded-lg">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      {viewingCustomer.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {viewingCustomer.phone}
                    </p>
                  </div>
                </div>

                <Tabs defaultValue="details">
                  <TabsList className="w-full">
                    <TabsTrigger value="details" className="flex-1">
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex-1">
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="bookings" className="flex-1">
                      Bookings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4 space-y-3">
                    {viewingCustomer.email && (
                      <div className="flex items-center gap-3 p-3 bg-black-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium">{viewingCustomer.email}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-black-50 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium">{viewingCustomer.phone}</p>
                        </div>
                      </div>

                      {/* Customer Hub / Operating Area in Dialog */}
                      {(() => {
                        const areaName = getCustomerAreaName(viewingCustomer);
                        if (!areaName) return null;
                        return (
                          <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                              <p className="text-xs text-amber-400 font-medium">Operating Hub / Area</p>
                              <p className="font-semibold text-foreground">
                                {areaName}
                                {viewingCustomer.area_id?.city ? ` (${viewingCustomer.area_id.city})` : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                    {viewingCustomer.address && (
                      <div className="flex items-center gap-3 p-3 bg-black-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Address</p>
                          <p className="font-medium">
                            {viewingCustomer.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {viewingCustomer.id_proof_type && (
                      <div className="flex items-center gap-3 p-3 bg-black-50 rounded-lg">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">
                            {viewingCustomer.id_proof_type}
                          </p>
                          <p className="font-medium">
                            {viewingCustomer.id_proof_number}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-500 pt-2">
                      Customer since{" "}
                      {viewingCustomer.createdAt || viewingCustomer.created_at
                        ? format(
                            new Date(
                              viewingCustomer.createdAt ||
                                viewingCustomer.created_at,
                            ),
                            "MMM d, yyyy",
                          )
                        : "N/A"}
                    </div>
                  </TabsContent>

                  {/* <TabsContent value="documents" className="mt-4 space-y-3">
                    <DocumentImageViewer
                      url={viewingCustomer.aadhaar_image_url}
                      label="Aadhaar Card"
                    />
                    <DocumentImageViewer
                      url={viewingCustomer.license_image_url}
                      label="Driving License"
                    />

                    {!viewingCustomer.aadhaar_image_url &&
                      !viewingCustomer.license_image_url && (
                        <p className="text-gray-500 text-center py-4">
                          No documents uploaded
                        </p>
                      )}
                  </TabsContent> */}

                  <TabsContent value="documents" className="mt-4 space-y-3">
                    {/* Existing Primary Documents */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Primary IDs
                      </h4>
                      <DocumentImageViewer
                        url={viewingCustomer.aadhaar_image_url}
                        label="Aadhaar Card"
                      />
                      <DocumentImageViewer
                        url={viewingCustomer.license_image_url}
                        label="Driving License"
                      />
                    </div>

                    {/* New Additional Documents Section */}
                    {viewingCustomer.extra_documents?.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-border">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Additional Documents
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {viewingCustomer.extra_documents.map((url, index) => (
                            <DocumentImageViewer
                              key={index}
                              url={url}
                              label={`Document ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State Logic */}
                    {!viewingCustomer.aadhaar_image_url &&
                      !viewingCustomer.license_image_url &&
                      (!viewingCustomer.extra_documents ||
                        viewingCustomer.extra_documents.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/30 rounded-lg border border-dashed">
                          <FileImage className="w-10 h-10 text-muted-foreground mb-2 opacity-20" />
                          <p className="text-sm text-muted-foreground">
                            No documents uploaded for this customer
                          </p>
                        </div>
                      )}
                  </TabsContent>

                  <TabsContent value="bookings" className="mt-4">
                    <CustomerBookingsPanel customerId={viewingCustomer._id} />
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
