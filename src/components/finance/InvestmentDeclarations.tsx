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
import { Coins, Upload, FileText, CheckCircle, Clock, AlertTriangle, Plus, Save } from "lucide-react";
import { toast } from "sonner";

interface Declaration {
  id: string;
  section: string;
  category: string;
  declared_amount: number;
  verified_amount: number;
  max_limit: number;
  proof_submitted: boolean;
  status: string;
}

export function InvestmentDeclarations() {
  const [activeTab, setActiveTab] = useState("declarations");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const declarations: Declaration[] = [
    {
      id: "1",
      section: "80C",
      category: "PPF",
      declared_amount: 50000,
      verified_amount: 50000,
      max_limit: 150000,
      proof_submitted: true,
      status: "verified"
    },
    {
      id: "2",
      section: "80C",
      category: "ELSS",
      declared_amount: 75000,
      verified_amount: 0,
      max_limit: 150000,
      proof_submitted: false,
      status: "pending"
    },
    {
      id: "3",
      section: "80D",
      category: "Health Insurance (Self & Family)",
      declared_amount: 25000,
      verified_amount: 25000,
      max_limit: 25000,
      proof_submitted: true,
      status: "verified"
    },
    {
      id: "4",
      section: "80D",
      category: "Health Insurance (Parents)",
      declared_amount: 30000,
      verified_amount: 0,
      max_limit: 50000,
      proof_submitted: false,
      status: "pending"
    },
    {
      id: "5",
      section: "24",
      category: "Housing Loan Interest",
      declared_amount: 150000,
      verified_amount: 150000,
      max_limit: 200000,
      proof_submitted: true,
      status: "verified"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const section80CTotal = declarations
    .filter(d => d.section === "80C")
    .reduce((sum, d) => sum + d.declared_amount, 0);

  const section80DTotal = declarations
    .filter(d => d.section === "80D")
    .reduce((sum, d) => sum + d.declared_amount, 0);

  const handleSaveDeclaration = () => {
    toast.success("Declaration saved successfully");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Declarations</h1>
          <p className="text-muted-foreground">Declare investments for tax benefits under various sections</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Declaration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Investment Declaration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Section</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="80C">Section 80C</option>
                  <option value="80D">Section 80D</option>
                  <option value="24">Section 24 (Home Loan)</option>
                  <option value="80E">Section 80E (Education Loan)</option>
                  <option value="80G">Section 80G (Donations)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Investment Type</Label>
                <Input placeholder="e.g., PPF, ELSS, LIC" />
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" placeholder="50000" />
              </div>
              <div className="space-y-2">
                <Label>Upload Proof</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Click to upload proof document</p>
                </div>
              </div>
              <Button onClick={handleSaveDeclaration} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Declaration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
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
            <div className="text-2xl font-bold text-green-600">
              {declarations.filter(d => d.status === "verified").length}
            </div>
            <p className="text-xs text-muted-foreground">Declarations verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Proof</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {declarations.filter(d => !d.proof_submitted).length}
            </div>
            <p className="text-xs text-muted-foreground">Upload required</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="declarations">My Declarations</TabsTrigger>
          <TabsTrigger value="section80c">Section 80C</TabsTrigger>
          <TabsTrigger value="section80d">Section 80D</TabsTrigger>
          <TabsTrigger value="homeloan">Home Loan</TabsTrigger>
        </TabsList>

        <TabsContent value="declarations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Declarations</CardTitle>
              <CardDescription>Your investment declarations for the current financial year</CardDescription>
            </CardHeader>
            <CardContent>
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
                      <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Declared Amount</p>
                            <p className="font-medium">₹{declaration.declared_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Verified Amount</p>
                            <p className="font-medium">₹{declaration.verified_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Section Limit</p>
                            <p className="font-medium">₹{declaration.max_limit.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {declaration.proof_submitted ? (
                              <>
                                <FileText className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600">Proof uploaded</span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-yellow-600">Proof pending</span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!declaration.proof_submitted && (
                              <Button variant="outline" size="sm">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Proof
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="section80c">
          <Card>
            <CardHeader>
              <CardTitle>Section 80C Investments</CardTitle>
              <CardDescription>PPF, ELSS, LIC, NSC, Tuition Fees, etc.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {declarations.filter(d => d.section === "80C").map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{d.category}</p>
                      <Badge className={getStatusColor(d.status)}>{d.status}</Badge>
                    </div>
                    <p className="text-xl font-bold">₹{d.declared_amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="section80d">
          <Card>
            <CardHeader>
              <CardTitle>Section 80D - Health Insurance</CardTitle>
              <CardDescription>Medical insurance premiums for self, family, and parents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {declarations.filter(d => d.section === "80D").map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{d.category}</p>
                      <Badge className={getStatusColor(d.status)}>{d.status}</Badge>
                    </div>
                    <p className="text-xl font-bold">₹{d.declared_amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homeloan">
          <Card>
            <CardHeader>
              <CardTitle>Home Loan Benefits</CardTitle>
              <CardDescription>Section 24 - Interest on Home Loan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {declarations.filter(d => d.section === "24").map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{d.category}</p>
                      <Badge className={getStatusColor(d.status)}>{d.status}</Badge>
                    </div>
                    <p className="text-xl font-bold">₹{d.declared_amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
