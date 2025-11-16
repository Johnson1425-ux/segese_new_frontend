import { NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Target,
  Users,
  Heart,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  ChevronRight,
  ChevronDown,
  Award,
  Shield,
  Clock,
  HeartHandshake,
  User,
  UserCog
} from "lucide-react";

// Sign In Dropdown Component
function SignInDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        Sign In
        <ChevronRight className={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="py-2">
            <a
              href="/login"
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 group"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Hospital Portal</div>
                <div className="text-xs text-gray-500">For hospital staff</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
            </a>

            <div className="border-t border-gray-100 my-1"></div>

            <a
              href="/staff-login"
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200 group"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-teal-200 transition-colors">
                <UserCog className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Pharmacy Portal</div>
                <div className="text-xs text-gray-500">For Fufumo staff members</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AboutUs() {
  const [activeLink, setActiveLink] = useState("about");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setActiveLink("about");
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const aboutItems = [
    {
      title: "Who We Are",
      description:
        "Segese Medical Clinic & Fufumo Pharmacy is a modern healthcare facility dedicated to providing comprehensive medical services to the community. We combine cutting-edge medical technology with compassionate care.",
      gradient: "from-blue-500 to-blue-600",
      icon: Building2,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Our Mission",
      description:
        "We are committed to delivering patient-centered, high-quality medical care tailored to each individual's needs. Our goal is to improve health outcomes and enhance the quality of life for all our patients.",
      gradient: "from-teal-500 to-teal-600",
      icon: Target,
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600"
    },
    {
      title: "Our Team",
      description:
        "A dedicated staff of skilled doctors, nurses, and pharmacists, working together to improve patient health and well-being. Our team brings years of experience and specialized expertise.",
      gradient: "from-purple-500 to-purple-600",
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      title: "Our Partners",
      description:
        "We work with NHIF, NSSF, BRITAM, and ASSEMBLE to ensure accessibility and affordability of healthcare services for all. We're committed to making quality healthcare available to everyone.",
      gradient: "from-green-500 to-green-600",
      icon: HeartHandshake,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We treat every patient with empathy and respect"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for the highest standards in healthcare"
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "We uphold ethical practices in all we do"
    },
    {
      icon: Clock,
      title: "Availability",
      description: "We're here for you 24/7 when you need us"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Top Navbar */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white shadow-lg py-4' 
            : 'bg-white/95 backdrop-blur-sm shadow-md py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <NavLink to="/home" className="flex items-center space-x-2 cursor-pointer group">
            <div 
              className="w-12 h-12 rounded-lg transform group-hover:scale-110 transition-transform duration-300 bg-cover bg-center"
              style={{ backgroundImage: "url('/SMC Logo.png')" }}
            >
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              SEGESE MEDICAL CLINIC
            </span>
          </NavLink>

          <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `hover:text-blue-600 transition-colors duration-200 ${
                  isActive ? "text-blue-600 font-semibold" : ""
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/our-services"
              className={({ isActive }) =>
                `hover:text-blue-600 transition-colors duration-200 ${
                  isActive ? "text-blue-600 font-semibold" : ""
                }`
              }
            >
              Services
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `hover:text-blue-600 transition-colors duration-200 ${
                  isActive ? "text-blue-600 font-semibold" : ""
                }`
              }
            >
              About Us
            </NavLink>
            <a
              href="#contact"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Contact Us
            </a>
          </nav>

          <SignInDropdown />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-700 rounded-full opacity-20 blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            About Us
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Learn more about our commitment to providing exceptional healthcare services to our community
          </p>
        </div>
      </section>

      {/* Main About Section */}
      <main className="flex-1 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          {/* About Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {aboutItems.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={idx}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  {/* Icon Header */}
                  <div className={`bg-gradient-to-br ${item.gradient} p-8 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                    <div className={`${item.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <IconComponent className={`w-8 h-8 ${item.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-white relative z-10">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <div className="p-8">
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Our Values Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, idx) => {
                const IconComponent = value.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow-md p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Experience Quality Healthcare?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied patients who trust us with their health
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <NavLink
                to="/our-services"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-200 transition-all duration-300 shadow-lg font-semibold"
              >
                View Our Services
                <ChevronRight className="w-5 h-5 ml-2" />
              </NavLink>
              <a
                href="#contact"
                className="inline-flex items-center px-8 py-4 bg-blue-700 text-white border-2 border-white rounded-lg hover:bg-blue-800 transition-all duration-300 font-semibold"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Contact */}
      <footer
        id="contact"
        className="bg-gray-900 text-gray-300 px-6 py-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-12 h-12  bg-white rounded-lg flex items-center justify-center">
                  <div 
                    className="w-12 h-12 rounded-lg transform group-hover:scale-110 transition-transform duration-300 bg-cover bg-center"
                    style={{ backgroundImage: "url('/SMC Logo.png')" }}
                  >
                  </div>
                </div>
                <span className="text-xl font-bold text-white">Segese Medical</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Providing quality healthcare services to the community with compassion and excellence.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-4">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 mt-1 text-blue-400" />
                  <span>Segese - Msalala, KAHAMA</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-blue-400" />
                  <a href="mailto:hospital@example.com" className="hover:text-white transition-colors">
                    hospital@example.com
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-blue-400" />
                  <a href="tel:+255762948291" className="hover:text-white transition-colors">
                    +255 762 948 291
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 transition-colors duration-300">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/segese_medical_clinic_?igsh=cWJrN3Z6YYXVxZzZp" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Segese Medical Clinic & Fufumo Pharmacy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}