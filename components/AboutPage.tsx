
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

      {/* Leadership Section */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img 
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80" 
              alt="Managing Director" 
              className="w-full h-full object-cover min-h-[300px]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="md:w-2/3 p-8 flex flex-col justify-center space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Managing Director</h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">Leadership & Strategy</p>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Leading the bridge between traditional agricultural wisdom and cutting-edge aerial intelligence. 
              Our commitment is to provide tools that respect the heritage of the land while embracing the 
              efficiency of the future.
            </p>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <a 
                href="mailto:info@cleofly.eu" 
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
              >
                <Mail size={18} />
                <span>info@cleofly.eu</span>
              </a>
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
