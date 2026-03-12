
import React from 'react';
import { Mail, Globe, Award, Target, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          {t('nav_about')}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 italic">
          “Pioneers before, Pioneers Now, Pioneers then”
        </p>
      </section>

      {/* Vision & Mission */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Target size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Vision</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Revolutionization global agriculture through intelligent aerial technologies that empower farmers
            with precision, trust, and sustainability — rooted in the origin of agriculture and inspired by cross-
            cultural collaboration between the Middle East and Europe.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Award size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Delivery advanced drone-based solutions for crop monitoring and livestock health detection,
            enabling farmers to make smarter, faster, and more sustainable decisions through precise data,
            accessible technology, and deep agricultural expertise.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-8">Leadership & Engineering</h2>
        
        {/* Managing Director */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all hover:-translate-y-1 duration-300">
          <div className="md:flex">
            <div className="md:w-1/3 relative">
              <img 
                src="manager.png"
                alt="Managing Director" 
                className="w-full h-full object-cover min-h-[300px]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r"></div>
            </div>
            <div className="md:w-2/3 p-8 flex flex-col justify-center space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Managing Director</h3>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-sm mt-1">Leadership & Strategy</p>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                Leading the bridge between traditional agricultural wisdom and cutting-edge aerial intelligence. 
                Our commitment is to provide tools that respect the heritage of the land while embracing the 
                efficiency of the future.
              </p>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center gap-4">
                <a 
                  href="mailto:info@cleofly.eu" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-medium"
                >
                  <Mail size={18} />
                  <span>info@cleofly.eu</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Full Stack Developer */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl border border-slate-700 overflow-hidden transform transition-all hover:-translate-y-1 duration-300 text-white">
          <div className="md:flex flex-row-reverse">
            <div className="md:w-1/3 relative">
              <img 
                src="me.png"
                alt="Full Stack Developer" 
                className="w-full h-full object-cover min-h-[300px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:bg-gradient-to-l"></div>
            </div>
            <div className="md:w-2/3 p-8 flex flex-col justify-center space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Full Stack Developer</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-bold uppercase tracking-wider border border-indigo-500/30">Engineering</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold uppercase tracking-wider border border-emerald-500/30">UI/UX</span>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed text-lg">
                Architecting the digital foundation behind our agricultural intelligence. Passionate about 
                crafting beautiful, high-performance interfaces that transform complex drone data into 
                intuitive, actionable insights for farmers worldwide.
              </p>
              <div className="pt-6 border-t border-slate-700 flex items-center gap-4">
                <a 
                  href="https://ayomide-port.vercel.app" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-200 transition-all font-medium border border-white/5"
                >
                  <Globe size={18} />
                  <span>View Portfolio</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="text-center space-y-6">
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium text-slate-600 dark:text-slate-400">
            <Globe size={16} />
            Middle East
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium text-slate-600 dark:text-slate-400">
            <Globe size={16} />
            Europe
          </div>
        </div>
      </section>
    </div>
  );
};
