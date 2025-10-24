import React from 'react';

// --- ICONS ---
import { Mail, Phone, Linkedin, Instagram, Twitter, Globe, MapPin, Github, ShieldCheck, Database, Tag, Copyright, ExternalLink, MessageCircle } from 'lucide-react';

// --- DATA ---
// This data can be shared or imported from a central file in a real application
const appData = {
  developer: {
    name: "Priyank Raychura",
    title: "Full Stack Developer",
    description: "Passionate developer with expertise in building scalable web applications. I specialize in React, Node.js, and modern web technologies. Always eager to learn new technologies and solve complex problems.",
    email: "priyankraychura@gmail.com",
    phone: "+91 9429042215",
    whatsapp: "+91 6359467208", // For wa.me link, no '+' or spaces
    location: "Ahmedabad, Gujarat, India",
    portfolio: "https://priyank.space",
    profileImage: `/profile.jpg`,
    socialLinks: {
      linkedin: "https://linkedin.com/in/priyankraychura",
      instagram: "https://instagram.com/priyankraychura",
      twitter: "https://x.com/priyankraychura",
      github: "https://github.com/priyankraychura"
    },
    skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript", "TypeScript", "Tailwind CSS", "Firebase", "Docker", "AWS"]
  },
  project: {
    name: "Admin Dashboard Panel",
    version: "1.2.5",
    lastUpdated: "October 7, 2025",
    ownership: "Priyank Raychura",
    license: "MIT License",
    licenseUrl: "https://opensource.org/licenses/MIT",
    termsUrl: "#", // Placeholder link
    privacyUrl: "#", // Placeholder link
    dataPolicy: {
      userData: "All application-specific user data is stored exclusively in your own database, ensuring you have full control and privacy.",
      credentials: "Panel access credentials and usage metadata are securely managed in our database to provide and improve this service."
    }
  }
};


// --- REUSABLE UI COMPONENTS ---

const SocialIcon = ({ name, ...props }) => {
  switch (name.toLowerCase()) {
    case 'linkedin': return <Linkedin {...props} />;
    case 'instagram': return <Instagram {...props} />;
    case 'twitter': return <Twitter {...props} />;
    case 'github': return <Github {...props} />;
    default: return <Globe {...props} />;
  }
};

const ContactCard = React.memo(({ icon: Icon, label, value, link, bgColor, iconColor }) => (
  <div className={`flex items-center space-x-3 p-4 ${bgColor} rounded-xl hover:shadow-md transition-all duration-300`}>
    <div className={`p-2 ${iconColor} rounded-full`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 overflow-hidden">
      <p className="text-xs text-gray-600 font-medium">{label}</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:text-blue-600 font-medium transition-colors truncate block">
        {value}
      </a>
    </div>
  </div>
));

const SocialButton = React.memo(({ name, link, color }) => (
  <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`Connect on ${name}`} className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg ${color} text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
    <SocialIcon name={name} className="w-5 h-5" />
    <span className="font-medium capitalize">{name}</span>
  </a>
));

const InfoRow = React.memo(({ icon: Icon, label, value, iconColorClass, labelColorClass, link }) => (
    <div className="flex items-start space-x-4">
        <Icon className={`w-5 h-5 ${iconColorClass} mt-1 flex-shrink-0`} aria-hidden="true" />
        <div className="flex-1">
            <p className={`text-sm font-semibold ${labelColorClass}`}>{label}</p>
            {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-sm text-gray-600 leading-relaxed hover:text-blue-600 transition-colors group">
                    <span>{value}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </a>
            ) : (
                <p className="text-sm text-gray-600 leading-relaxed">{value}</p>
            )}
        </div>
    </div>
));

const ProjectInfoSection = React.memo(({ data }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Application Information</h3>
        <div className="space-y-4">
            <InfoRow icon={Tag} label="Version" value={data.version} iconColorClass="text-sky-500" labelColorClass="text-sky-700" />
            <InfoRow icon={Copyright} label="Ownership" value={data.ownership} iconColorClass="text-violet-500" labelColorClass="text-violet-700" />
            <InfoRow icon={ShieldCheck} label="License" value={data.license} link={data.licenseUrl} iconColorClass="text-emerald-500" labelColorClass="text-emerald-700" />
            <InfoRow icon={Database} label="Your Data" value={data.dataPolicy.userData} iconColorClass="text-amber-500" labelColorClass="text-amber-700" />
            <InfoRow icon={Database} label="Service Credentials" value={data.dataPolicy.credentials} iconColorClass="text-rose-500" labelColorClass="text-rose-700" />
        </div>
    </div>
));

const Footer = React.memo(({ projectData }) => (
    <div className="bg-white rounded-xl shadow-lg mt-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
            <div>
                <p className="text-sm font-semibold text-slate-800">{projectData.ownership}</p>
                <p className="text-xs text-gray-500 mt-1">&copy; {new Date().getFullYear()} All Rights Reserved.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4 text-sm">
                 <a href={projectData.termsUrl} className="font-medium text-blue-600 hover:text-blue-800 transition-colors">Terms & Conditions</a>
                 <span className="text-gray-300 hidden sm:inline">|</span>
                 <a href={projectData.privacyUrl} className="font-medium text-blue-600 hover:text-blue-800 transition-colors">Privacy Policy</a>
            </div>
        </div>
    </div>
));

// --- STATIC PAGE CONTENT COMPONENT ---
// Re-architected to a single-column stack with horizontal items inside cards.
const AboutContent = React.memo(({ developerData, projectData }) => (
    <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <img src={developerData.profileImage} alt={developerData.name} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg border-4 border-white" />
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{developerData.name}</h2>
                    <p className="text-lg md:text-xl text-blue-600 font-medium mt-1">{developerData.title}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-2 mt-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{developerData.location}</span>
                    </div>
                    <p className="text-gray-600 mt-4 leading-relaxed max-w-3xl">{developerData.description}</p>
                </div>
            </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ContactCard icon={Phone} label="Phone" value={developerData.phone} link={`tel:${developerData.phone}`} bgColor="bg-gray-100" iconColor="bg-gray-200 text-gray-600" />
                <ContactCard icon={MessageCircle} label="WhatsApp" value={developerData.phone} link={`https://wa.me/${developerData.whatsapp}`} bgColor="bg-emerald-50" iconColor="bg-emerald-200 text-emerald-600" />
                <ContactCard icon={Mail} label="Email" value={developerData.email} link={`mailto:${developerData.email}`} bgColor="bg-blue-50" iconColor="bg-blue-200 text-blue-600" />
                <ContactCard icon={Globe} label="Portfolio" value={developerData.portfolio} link={developerData.portfolio} bgColor="bg-purple-50" iconColor="bg-purple-200 text-purple-600" />
            </div>
        </div>

        {/* Connect With Me Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Connect With Me</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SocialButton name="linkedin" link={developerData.socialLinks.linkedin} color="bg-blue-500 hover:bg-blue-600" />
                <SocialButton name="github" link={developerData.socialLinks.github} color="bg-gray-700 hover:bg-gray-800" />
                <SocialButton name="twitter" link={developerData.socialLinks.twitter} color="bg-sky-400 hover:bg-sky-500" />
                <SocialButton name="instagram" link={developerData.socialLinks.instagram} color="bg-pink-500 hover:bg-pink-600" />
            </div>
        </div>

        {/* Skills & Technologies Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Skills & Technologies</h3>
            <div className="flex flex-wrap gap-2">
                {developerData.skills.map((skill) => (
                    <span key={skill} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full hover:bg-blue-200 transition-colors cursor-default">{skill}</span>
                ))}
            </div>
        </div>

        {/* Application Information Card */}
        <ProjectInfoSection data={projectData} />
        
        {/* Footer */}
        <Footer projectData={projectData} />
    </div>
));


// --- MAIN PAGE COMPONENT ---
// Removed max-width to allow the content to fill the screen, with padding for control.
const AboutPage = () => {
    return (
        <div className="space-y-6">
            <div className="">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900">About & Application Information</h1>
                    <p className="text-lg text-gray-600 mt-2">Details about the developer and the admin panel.</p>
                </header>
                <main>
                    <AboutContent developerData={appData.developer} projectData={appData.project} />
                </main>
            </div>
        </div>
    );
};

export default AboutPage;

