import React, { useContext } from 'react';
import { Card } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Avatar } from 'src/components/ui/avatar';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion } from "framer-motion";
import AppHelmet from 'src/components/AppHelmet';
import { LanguageContext } from 'src/context/LanguageContext';

const translations = {
  en: {
    title: "Rondindon",
    description:
      "Hi! I'm Rondindon, a passionate developer specializing in building efficient and scalable web applications. I love exploring new technologies and continuously improving my skills.",
    github: "GitHub",
    linkedin: "LinkedIn",
    helmetTitle: "DriveReady - About me",
    helmetDescription:
      "Learn more about Rondindon, a passionate developer specializing in building efficient and scalable web applications.",
  },
  sk: {
    title: "Rondindon",
    description:
      "Ahoj! Som Rondindon, zanietený vývojár so zameraním na tvorbu efektívnych a škálovateľných webových aplikácií. Rád objavujem nové technológie a neustále sa zdokonaľujem.",
    github: "GitHub",
    linkedin: "LinkedIn",
    helmetTitle: "DriveReady - O mne",
    helmetDescription:
      "Zistite viac o Rondindonovi, zanietenom vývojárovi so zameraním na tvorbu efektívnych a škálovateľných webových aplikácií.",
  },
};

const AboutPage: React.FC = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  // Define animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const glowAnimation = {
    animate: {
      scale: [1, 1.02, 1],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <AppHelmet 
        title={t.helmetTitle} 
        description={t.helmetDescription} 
      />
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="max-w-lg w-full"
      >
        <Card className="bg-[hsl(var(--card))] shadow-lg rounded-lg p-8">
          <motion.div
            variants={childVariants}
            className="flex flex-col items-center"
          >
            <motion.div className="relative group" {...glowAnimation}>
              <Avatar className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-[hsl(var(--ring))] sm:w-24 sm:h-24">
                <img
                  src="https://github.com/rondindon.png"
                  alt="Rondindon Avatar"
                  className="w-full h-full object-cover"
                />
              </Avatar>
              <motion.div
                className="absolute top-0 left-0 w-32 h-32 rounded-full bg-[hsl(var(--ring))] opacity-10 blur-lg sm:w-24 sm:h-24"
                variants={{
                  animate: {
                    scale: [1, 1.1, 1],
                  },
                }}
                animate="animate"
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              ></motion.div>
            </motion.div>

            <motion.h1
              variants={childVariants}
              className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2"
            >
              {t.title}
            </motion.h1>

            <motion.p
              variants={childVariants}
              className="text-center text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed"
            >
              {t.description}
            </motion.p>

            <motion.div
              variants={childVariants}
              className="flex space-x-4"
            >
              <Button
                asChild
                variant="outline"
                className="flex items-center space-x-2 border-[hsl(var(--foreground))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors duration-300"
              >
                <a
                  href="https://github.com/rondindon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                  aria-label="Visit Rondindon's GitHub Profile"
                >
                  <FaGithub size={20} />
                  <span>{t.github}</span>
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="flex items-center space-x-2 border-[hsl(var(--foreground))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors duration-300"
              >
                <a
                  href="https://www.linkedin.com/in/ronnie-ryb%C3%A1rik-a8094524b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                  aria-label="Visit Rondindon's LinkedIn Profile"
                >
                  <FaLinkedin size={20} />
                  <span>{t.linkedin}</span>
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AboutPage;