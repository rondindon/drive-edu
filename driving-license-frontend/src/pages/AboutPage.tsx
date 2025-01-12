// src/pages/AboutPage.tsx
import React from 'react';
import { Card } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Avatar } from 'src/components/ui/avatar';
import { FaGithub } from 'react-icons/fa';
import { FaLinkedin } from 'react-icons/fa'; // Optional: For additional social links

const AboutPage: React.FC = () => {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fadeIn">
        {/* Main Content */}
        <Card className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8 transform animate-scaleUp">
          <div className="flex flex-col items-center">
            {/* Avatar with Glow Effect */}
            <div className="relative group">
              <Avatar className="w-32 h-32 mb-6 rounded-full overflow-hidden sm:w-24 sm:h-24">
                <img
                  src="https://github.com/rondindon.png" // GitHub profile picture URL
                  alt="Rondindon Avatar"
                  className="w-full h-full object-cover"
                />
              </Avatar>
              {/* Glow Effect */}
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full animate-glow sm:w-24 sm:h-24"></div>
            </div>
  
            {/* Name */}
            <h1 className="text-3xl font-bold text-main-darkBlue mb-2">Rondindon</h1>
  
            {/* Introduction */}
            <p className="text-center text-main-darkBlue mb-6 leading-relaxed">
              Hi! I'm Rondindon, a passionate developer specializing in building efficient and scalable web applications. I love exploring new technologies and continuously improving my skills.
            </p>
  
            {/* Social Buttons */}
            <div className="flex space-x-4">
              {/* GitHub Button */}
              <Button
                asChild
                variant="outline" // Ensure 'outline' is a valid variant in shadcn
                className="flex items-center space-x-2 border-main-darkBlue text-main-darkBlue hover:bg-main-darkBlue hover:text-white transition-colors duration-300"
              >
                <a
                  href="https://github.com/rondindon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                  aria-label="Visit Rondindon's GitHub Profile"
                >
                  <FaGithub size={20} />
                  <span>GitHub</span>
                </a>
              </Button>
  
              {/* LinkedIn Button */}
              <Button
                asChild
                variant="outline"
                className="flex items-center space-x-2 border-main-darkBlue text-main-darkBlue hover:bg-main-darkBlue hover:text-white transition-colors duration-300"
              >
                <a
                  href="https://www.linkedin.com/in/ronnie-ryb%C3%A1rik-a8094524b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                  aria-label="Visit Rondindon's LinkedIn Profile"
                >
                  <FaLinkedin size={20} />
                  <span>LinkedIn</span>
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };
  
export default AboutPage;