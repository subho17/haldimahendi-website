import React from 'react';
import { Check } from 'lucide-react';

export default function HappyMarriages() {
  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">6 Cs of Happy Marriages</h1>
      
      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6 text-[15px] sm:text-base mb-8">
        <p>
          Years of experience and research has taught us that marriage, much like life, is an evolving journey. It involves two people, their unique personalities, dreams, emotions, and values. Marriage is an institution with unlimited variables that cannot simply be reduced to a mechanical algorithm. A thriving, joyful marriage requires a harmonious blend of Compatibility, Chemistry, Commitment, Community, Communication, and Compassion.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 space-y-6 not-prose">
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-white shadow-xs flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-gray-800 m-0 text-sm sm:text-base leading-relaxed">
            <span className="font-bold text-gray-900">Compatibility</span> — A shared set of lifestyle values, goals, and interests that creates strong common ground between two individuals.
          </p>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-white shadow-xs flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-gray-800 m-0 text-sm sm:text-base leading-relaxed">
            <span className="font-bold text-gray-900">Chemistry</span> — The spark and intuitive emotional rapport that makes two people effortlessly click with each other.
          </p>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-white shadow-xs flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-gray-800 m-0 text-sm sm:text-base leading-relaxed">
            <span className="font-bold text-gray-900">Commitment</span> — An explicit, shared dedication and loyalty from both partners to nurture and protect their relationship through all phases of life.
          </p>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-white shadow-xs flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-gray-800 m-0 text-sm sm:text-base leading-relaxed">
            <span className="font-bold text-gray-900">Community</span> — An encouraging circle of family and loved ones who support, celebrate, and enrich the partnership.
          </p>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-white shadow-xs flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-gray-800 m-0 text-sm sm:text-base leading-relaxed">
            <span className="font-bold text-gray-900">Communication</span> — Open, empathetic, and respectful dialogue that fosters deep understanding and dissolves misunderstandings early.
          </p>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center bg-white shadow-xs flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-gray-800 m-0 text-sm sm:text-base leading-relaxed">
            <span className="font-bold text-gray-900">Compassion</span> — A gentle, forgiving kindness and emotional generosity that turns a marriage into a peaceful sanctuary.
          </p>
        </div>
      </div>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6 text-[15px] sm:text-base mt-8">
        <p>
          At <strong>Haldimehendi.com</strong>, we actively weave these principles into our match recommendation features, helping you discover partners who resonate with your values for a lifetime of shared joy.
        </p>
      </div>
    </div>
  );
}
