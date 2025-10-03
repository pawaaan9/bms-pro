import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Settings, 
  Shield, 
  BarChart3, 
  FileText, 
  Building2,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Heart,
  Award,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Printer,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import judyImage from "@/assets/judy.jpg";
import image2 from "@/assets/image 2.jpg";

export default function Management() {
  const { user, isSuperAdmin, isHallOwner, isSubUser } = useAuth();
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showPrintView, setShowPrintView] = useState(false);

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handlePrint = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  };

  const journeyTimeline = [
    {
      title: "First fundraiser: Royal Children's Hospital Appeal",
      description: "Ran a stall outside the local butcher — early start to lifelong service.",
      color: "bg-blue-500"
    },
    {
      title: "Girl Guides & Scouts Leadership",
      description: "Brownie Leader (incl. Second Frankston Brownie Pack); later Cub Leader with Scouts.",
      color: "bg-green-500"
    },
    {
      title: "Family & Local Committees",
      description: "Grimwade Crescent Preschool; St John's School parent committee; Safety House at St John's.",
      color: "bg-amber-500"
    },
    {
      title: "Cranbourne Chamber of Commerce",
      description: "Served as President & Vice President — built bridges with local business.",
      color: "bg-blue-500"
    },
    {
      title: "Founded \"Spirit of Cranbourne\"",
      description: "Community group uniting business & community initiatives.",
      color: "bg-green-500"
    },
    {
      title: "City of Casey — Volunteer of the Year (≈2013)",
      description: "Recognition for outstanding community contribution.",
      color: "bg-amber-500"
    },
    {
      title: "Cranbourne Public Hall — Venue Manager (Volunteer)",
      description: "Over 10 years keeping the hall welcoming, safe, and well-run.",
      color: "bg-blue-500"
    }
  ];

  return (
    <div className={`space-y-6 ${showPrintView ? 'print-view' : ''}`}>
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-50 via-green-50 to-amber-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-700" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cranbourne Public Hall</h1>
              </div>
              <p className="text-gray-700 mt-1">Volunteer Profile: Judy Davis</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-white/70 text-gray-900 border-white/60">Volunteer-run</Badge>
                <Badge className="bg-white/70 text-gray-900 border-white/60">Community Venue</Badge>
                <Badge className="bg-white/70 text-gray-900 border-white/60">Welcoming & Safe</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="hidden print:hidden text-gray-900 border-gray-300 hover:bg-white/60"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print / Save PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Section */}
      <div className="grid md:grid-cols-[auto,1fr] gap-6">
        {/* Profile Card */}
        <Card className="w-fit profile-card">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img 
                  src={judyImage} 
                  alt="Judy Davis" 
                  className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Judy Davis</h2>
              <p className="text-gray-600 mb-4">Venue Manager (Volunteer)</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-blue-100 text-blue-800">10+ yrs at CPH</Badge>
                <Badge className="bg-green-100 text-green-800">Volunteering since age 12</Badge>
                <Badge className="bg-amber-100 text-amber-800">Volunteer of the Year (≈2013)</Badge>
              </div>
              
              <blockquote className="text-sm text-gray-600 italic border-l-4 border-blue-500 pl-4">
                "I classify myself as an <span className="font-semibold text-gray-900">addicted volunteer</span>."
              </blockquote>
            </div>
          </CardContent>
        </Card>

        {/* Highlights Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">What Judy Does to Keep the Hall Afloat</CardTitle>
            <CardDescription>
              Judy is the friendly face at the door and the steady hand behind the scenes, coordinating bookings, payments, refunds, suppliers, safety, and customer satisfaction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-gray-200 p-4">
                <h4 className="font-semibold mb-2">Front-of-House & Bookings</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Greets visitors & hirers</li>
                  <li>• Manages reservations & calendar</li>
                  <li>• Handles payments & refunds</li>
                  <li>• Customer queries & support</li>
                </ul>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <h4 className="font-semibold mb-2">Suppliers & Safety</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Delegates supplies (Bill: paper towels, toilet paper, cleaning chemicals)</li>
                  <li>• Coordinates renovations with builder <span className="font-medium text-gray-900">Dominic</span></li>
                  <li>• Works with the volunteer committee</li>
                  <li>• Oversees OH&S, exits, basic site checks</li>
                </ul>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs uppercase text-gray-500 mb-1">Service</div>
                <div className="text-2xl font-extrabold text-gray-900">Community-first</div>
                <p className="text-sm text-gray-600">Every booking gets helpful, friendly guidance.</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs uppercase text-gray-500 mb-1">Reliability</div>
                <div className="text-2xl font-extrabold text-gray-900">Efficient systems</div>
                <p className="text-sm text-gray-600">Clear processes for bookings, refunds & access.</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs uppercase text-gray-500 mb-1">Safety</div>
                <div className="text-2xl font-extrabold text-gray-900">Up-to-scratch</div>
                <p className="text-sm text-gray-600">Proactive coordination with contractors & committee.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photo Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Meet the Team</CardTitle>
          <CardDescription>Dedicated volunteers making a difference in our community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="relative inline-block">
                <img 
                  src={judyImage} 
                  alt="Judy Davis - Venue Manager" 
                  className="w-48 h-48 rounded-2xl object-cover shadow-lg mx-auto"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mt-4 text-gray-900">Judy Davis</h3>
              <p className="text-sm text-gray-600">Venue Manager (Volunteer)</p>
              <p className="text-xs text-gray-500 mt-1">10+ years of dedicated service</p>
            </div>
            <div className="text-center">
              <div className="relative inline-block">
                <img 
                  src={image2} 
                  alt="Bill Davis - Supplies Coordinator" 
                  className="w-48 h-48 rounded-2xl object-cover shadow-lg mx-auto"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mt-4 text-gray-900">Bill Davis</h3>
              <p className="text-sm text-gray-600">Supplies Coordinator</p>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                <Badge className="bg-gray-100 text-gray-800">Volunteer</Badge>
                <Badge className="bg-gray-100 text-gray-800">Supplies</Badge>
                <Badge className="bg-gray-100 text-gray-800">Inventory</Badge>
                <Badge className="bg-gray-100 text-gray-800">Vendors</Badge>
              </div>
              <div className="text-xs text-gray-500 mt-3">
                <div className="uppercase tracking-wide text-gray-400">About</div>
                <ul className="mt-1 space-y-1 text-left inline-block">
                  <li>• Procures and manages paper towels, toilet paper, and cleaning chemicals.</li>
                  <li>• Coordinates with Venue Manager for stock thresholds and supplier timing.</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journey Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Judy's Volunteer Journey</CardTitle>
            <span className="text-xs text-gray-500">Highlights & milestones</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-8">
              {journeyTimeline.map((item, index) => (
                <div key={index} className="relative flex items-start timeline-item">
                  <div className={`absolute left-3 w-3 h-3 rounded-full ${item.color} border-2 border-white shadow-sm`}></div>
                  <div className="ml-8">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Day-to-Day Responsibilities & Quick SOPs</CardTitle>
            <span className="text-xs text-gray-500">Internal reference</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold mb-2">Bookings & Customer Care</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Confirm enquiries → collect details → issue quote</li>
                <li>• Accept payment → send receipt → update calendar</li>
                <li>• Provide access & hall rules; note special needs</li>
                <li>• Post-event: bond/ refund processing within set SLA</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold mb-2">Suppliers & Stock</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Delegate consumables to <span className="text-gray-900">Bill</span> (paper towels, TP, cleaning chemicals)</li>
                <li>• Weekly stock check → reorder thresholds</li>
                <li>• Maintain supplier list & contacts</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold mb-2">Safety & Maintenance</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Walk-through checks: exits clear, signage in place</li>
                <li>• Coordinate works with builder <span className="text-gray-900">Dominic</span></li>
                <li>• Log issues; escalate to volunteer committee</li>
                <li>• Keep incident & inspection records current</li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 expandable-section">
            <button 
              className="flex items-center justify-between w-full text-left font-semibold cursor-pointer"
              onClick={() => toggleSection('refunds')}
            >
              <span>Refunds & Bonds — Process</span>
              {expandedSections.has('refunds') ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </button>
            {expandedSections.has('refunds') && (
              <ol className="mt-3 list-decimal ml-5 text-sm text-gray-600 space-y-2">
                <li>Confirm eligibility (booking terms met, no damage reported).</li>
                <li>Cross-check hire time, key return, and cleaning status.</li>
                <li>Initiate refund via payment method; record reference.</li>
                <li>Notify hirer with confirmation email/SMS.</li>
              </ol>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Impact & Recognition */}
      <Card className="bg-gradient-to-br from-blue-50 via-green-50 to-amber-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl">Impact & Recognition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white border border-gray-200 p-5">
              <h4 className="font-semibold mb-2">Community Impact</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Stronger links between residents, groups, and businesses</li>
                <li>• Smoother hall access & better hirer experience</li>
                <li>• Consistent safety & upkeep throughout renovations</li>
              </ul>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-5">
              <h4 className="font-semibold mb-2">Recognition</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• City of Casey Volunteer of the Year (≈2013)</li>
                <li>• Leadership in Chamber of Commerce</li>
                <li>• Founder of "Spirit of Cranbourne"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cranbourne Public Hall — Committee</CardTitle>
          <CardDescription>Volunteer-run venue serving the Cranbourne community.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>Primary Contact: <span className="font-medium">Volunteer Committee</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>Email: <span className="text-gray-500">[add official address]</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>Phone: <span className="text-gray-500">[add number]</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>Location: <span className="text-gray-500">Cranbourne, Victoria</span></span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <h5 className="font-semibold mb-2">Notes</h5>
              <p className="text-sm text-gray-600 mb-3">
                This page profiles <span className="font-medium text-gray-900">Judy Davis</span> and her contributions as Venue Manager (Volunteer). For updates, edit this file and re-publish.
              </p>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print / Save as PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print-view { 
            background: white !important;
            color: black !important;
          }
          .print-view .bg-gradient-to-br { 
            background: #f8fafc !important;
          }
        }
        
        /* Custom animations and hover effects */
        .profile-card {
          transition: transform 0.2s ease-in-out;
        }
        
        .profile-card:hover {
          transform: translateY(-2px);
        }
        
        .timeline-item {
          transition: all 0.3s ease;
        }
        
        .timeline-item:hover {
          transform: translateX(4px);
        }
        
        .expandable-section {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}
