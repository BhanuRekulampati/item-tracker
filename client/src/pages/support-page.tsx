import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import TabNavigation from "@/components/tab-navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle, HelpCircle } from "lucide-react";

export default function SupportPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <TabNavigation activeTab="dashboard" />
        
        <div className="py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Get Support</h1>
          <p className="mt-1 text-sm text-gray-500">We're here to help you with any questions or issues.</p>
          
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Reach out to our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Support</p>
                    <a 
                      href="mailto:rekulampatibhanu@gmail.com?subject=QR-Track Support Request"
                      className="text-sm text-primary hover:underline"
                    >
                      rekulampatibhanu@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone Support</p>
                    <a 
                      href="tel:6301822539"
                      className="text-sm text-primary hover:underline"
                    >
                      +91 6301822539
                    </a>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    asChild 
                    className="w-full"
                  >
                    <a href="mailto:rekulampatibhanu@gmail.com?subject=QR-Track Support Request&body=Hello,%0D%0A%0D%0AI need help with:%0D%0A%0D%0A%0D%0AUser: {user?.username || 'N/A'}">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help & Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Help & Resources</CardTitle>
                <CardDescription>Find answers to common questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <HelpCircle className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">How to create a QR code?</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Go to "Generate New QR Code" and fill in your item details. Print and attach the QR code to your item.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <HelpCircle className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">How to scan a QR code?</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Use the "Scan QR Code" feature to scan a QR code and view the owner's contact information.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <HelpCircle className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">How to update contact info?</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Go to "Profile Settings" to update your name, email, and phone number.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Help */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>We're available to assist you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  variant="outline"
                  className="flex-1"
                >
                  <a href="mailto:rekulampatibhanu@gmail.com?subject=QR-Track Support Request">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Support
                  </a>
                </Button>
                <Button 
                  asChild 
                  variant="outline"
                  className="flex-1"
                >
                  <a href="tel:6301822539">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

