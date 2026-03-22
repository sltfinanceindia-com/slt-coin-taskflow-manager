 import { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
 import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
 import { Coins, Upload, FileText, CheckCircle, Clock, AlertTriangle, Plus, Save, Loader2 } from "lucide-react";
 import { useInvestmentDeclarations } from "@/hooks/useInvestmentDeclarations";
 
 const SECTION_LIMITS: Record<string, number> = {
   '80C': 150000,
   '80D': 75000,
   '24': 200000,
   '80E': 0,
   '80G': 0,
 };
 
 const currentFY = () => {
   const now = new Date();
   const year = now.getFullYear();
   const month = now.getMonth();
   return month >= 3 ? `${year}-${(year + 1).toString().slice(-2)}` : `${year - 1}-${year.toString().slice(-2)}`;
 };
 
 export function InvestmentDeclarations() {
   const { declarations, isLoading, createDeclaration } = useInvestmentDeclarations();
   const [activeTab, setActiveTab] = useState("declarations");
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [newDeclaration, setNewDeclaration] = useState({
     section: '80C',
     category: '',
     amount: '',
   });
 
   const getStatusColor = (status: string) => {
     switch (status) {
       case "verified": return "bg-green-500";
       case "pending": return "bg-yellow-500";
       case "rejected": return "bg-red-500";
       default: return "bg-gray-500";
     }
   };
 
   const section80CTotal = declarations.filter(d => d.section === "80C").reduce((sum, d) => sum + d.declared_amount, 0);
   const section80DTotal = declarations.filter(d => d.section === "80D").reduce((sum, d) => sum + d.declared_amount, 0);
 
   const handleSaveDeclaration = async () => {
     if (!newDeclaration.category || !newDeclaration.amount) return;
     try {
       await createDeclaration.mutateAsync({
         section: newDeclaration.section,
         category: newDeclaration.category,
         declared_amount: parseFloat(newDeclaration.amount),
         max_limit: SECTION_LIMITS[newDeclaration.section] || 0,
         financial_year: currentFY(),
       });
       setNewDeclaration({ section: '80C', category: '', amount: '' });
       setIsDialogOpen(false);
     } catch (error) {
       console.error('Save declaration error:', error);
     }
   };
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6 p-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
         <div>
           <h1 className="text-3xl font-bold">Investment Declarations</h1>
           <p className="text-muted-foreground">Declare investments for tax benefits</p>
         </div>
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogTrigger asChild>
             <Button><Plus className="mr-2 h-4 w-4" />Add Declaration</Button>
           </DialogTrigger>
           <DialogContent className="max-w-md">
             <DialogHeader><DialogTitle>Add Investment Declaration</DialogTitle></DialogHeader>
             <div className="space-y-4">
               <div className="space-y-2">
                 <Label>Section</Label>
                 <select className="w-full p-2 border rounded-md" value={newDeclaration.section} onChange={(e) => setNewDeclaration(prev => ({ ...prev, section: e.target.value }))}>
                   <option value="80C">Section 80C</option>
                   <option value="80D">Section 80D</option>
                   <option value="24">Section 24 (Home Loan)</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <Label>Investment Type</Label>
                 <Input placeholder="e.g., PPF, ELSS" value={newDeclaration.category} onChange={(e) => setNewDeclaration(prev => ({ ...prev, category: e.target.value }))} />
               </div>
               <div className="space-y-2">
                 <Label>Amount (₹)</Label>
                 <Input type="number" placeholder="50000" value={newDeclaration.amount} onChange={(e) => setNewDeclaration(prev => ({ ...prev, amount: e.target.value }))} />
               </div>
               <Button onClick={handleSaveDeclaration} className="w-full" disabled={createDeclaration.isPending}>
                 {createDeclaration.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                 <Save className="mr-2 h-4 w-4" />Save Declaration
               </Button>
             </div>
           </DialogContent>
         </Dialog>
       </div>
 
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Section 80C</CardTitle>
             <Coins className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">₹{section80CTotal.toLocaleString()}</div>
             <Progress value={(section80CTotal / 150000) * 100} className="mt-2" />
             <p className="text-xs text-muted-foreground mt-1">Limit: ₹1,50,000</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Section 80D</CardTitle>
             <Coins className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">₹{section80DTotal.toLocaleString()}</div>
             <Progress value={(section80DTotal / 75000) * 100} className="mt-2" />
             <p className="text-xs text-muted-foreground mt-1">Limit: ₹75,000</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Verified</CardTitle>
             <CheckCircle className="h-4 w-4 text-green-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-green-600">{declarations.filter(d => d.status === "verified").length}</div>
             <p className="text-xs text-muted-foreground">Declarations verified</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Pending</CardTitle>
             <AlertTriangle className="h-4 w-4 text-yellow-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold text-yellow-600">{declarations.filter(d => !d.proof_submitted).length}</div>
             <p className="text-xs text-muted-foreground">Proof required</p>
           </CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <CardTitle>All Declarations</CardTitle>
           <CardDescription>Your investment declarations for the current financial year</CardDescription>
         </CardHeader>
         <CardContent>
           {declarations.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
               <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
               <p>No declarations yet</p>
             </div>
           ) : (
             <Accordion type="single" collapsible className="w-full">
               {declarations.map((declaration) => (
                 <AccordionItem key={declaration.id} value={declaration.id}>
                   <AccordionTrigger className="hover:no-underline">
                     <div className="flex items-center justify-between w-full pr-4">
                       <div className="flex items-center gap-4">
                         <Badge variant="outline">{declaration.section}</Badge>
                         <span>{declaration.category}</span>
                       </div>
                       <div className="flex items-center gap-4">
                         <span className="font-medium">₹{declaration.declared_amount.toLocaleString()}</span>
                         <Badge className={getStatusColor(declaration.status)}>{declaration.status}</Badge>
                       </div>
                     </div>
                   </AccordionTrigger>
                   <AccordionContent>
                     <div className="grid grid-cols-3 gap-4 pt-4">
                       <div>
                         <p className="text-sm text-muted-foreground">Declared</p>
                         <p className="font-medium">₹{declaration.declared_amount.toLocaleString()}</p>
                       </div>
                       <div>
                         <p className="text-sm text-muted-foreground">Verified</p>
                         <p className="font-medium">₹{declaration.verified_amount.toLocaleString()}</p>
                       </div>
                       <div>
                         <p className="text-sm text-muted-foreground">Limit</p>
                         <p className="font-medium">₹{declaration.max_limit.toLocaleString()}</p>
                       </div>
                     </div>
                   </AccordionContent>
                 </AccordionItem>
               ))}
             </Accordion>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }