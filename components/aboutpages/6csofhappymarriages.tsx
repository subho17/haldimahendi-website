import React from 'react';
import { Check } from 'lucide-react';

export default function HappyMarriages() {
  return (
    <main className="flex-1 max-w-4xl">
      <h1 className="text-3xl font-semibold text-[#253252] mb-6">6 Cs of happy marriages</h1>
      
      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6 text-[16px] mb-10">
        <p>
          Years of experience and research has taught us that marriage, much like life, is not that simple. It involves two people, their personalities, their desires, their emotions, and their psychology. Marriage, we learned is an institution with unlimited variables, that cannot simply be formulated into a software application. A successful marriage requires a mix of Compatibility, Chemistry, Commitment, Community, Communication and Compassion.
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 space-y-8 not-prose">
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm flex-shrink-0 mt-0.5">
            <Check className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-gray-800 m-0 text-[16px] leading-relaxed">
            <span className="font-semibold text-gray-900">Compatibility</span> - A set of interests and values that establishes a common ground between two people
          </p>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm flex-shrink-0 mt-0.5">
            <Check className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-gray-800 m-0 text-[16px] leading-relaxed">
            <span className="font-semibold text-gray-900">Chemistry</span> - Indefinable attributes that make two people &apos;click&apos; with each other
          </p>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm flex-shrink-0 mt-0.5">
            <Check className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-gray-800 m-0 text-[16px] leading-relaxed">
            <span className="font-semibold text-gray-900">Commitment</span> - An explicit and implicit understanding that both partners are dedicated to making the relationship work
          </p>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm flex-shrink-0 mt-0.5">
            <Check className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-gray-800 m-0 text-[16px] leading-relaxed">
            <span className="font-semibold text-gray-900">Community</span> - A network of family and friends to support and nurture the relationship
          </p>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm flex-shrink-0 mt-0.5">
            <Check className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-gray-800 m-0 text-[16px] leading-relaxed">
            <span className="font-semibold text-gray-900">Communication</span> - An effort to express feelings and share experiences with each other
          </p>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm flex-shrink-0 mt-0.5">
            <Check className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-gray-800 m-0 text-[16px] leading-relaxed">
            <span className="font-semibold text-gray-900">Compassion</span> - A human quality that becomes all the more important for developing a successful relationship
          </p>
        </div>
      </div>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6 text-[16px] mt-10">
        <p>
          Our findings indicate that different people give different weightage to the above factors in their description of an ideal life partner and consequently they are looking for different things in an ideal match making solution.
        </p>
        <p>
          So, while somebody thinks - &apos;The most important thing to me is to be able to set filters so that I only meet people that I am interested in. Why should I have to deal with somebody I am clear I do not wish to marry&apos;, others are of the opinion that - &apos;I am simply exploring whether I am ready to get married. I think I am but I will only truly know when I meet the &apos;right&apos; person. So, for me I want a service where I can meet a large number of diverse people&apos;.
        </p>
        <p>
          A person in Mumbai &apos;wants to meet someone who has a lot in common with them&apos; while somebody in Chennai &apos;would rather marry somebody who is exactly the opposite&apos;. A girl in New York told us that &apos;two diverse people form a greater whole&apos; while a gentleman in London indicated that &apos;common interests are the key to compatibility&apos;.
        </p>
        <p>
          At Shaadi.com we are constantly applying new learnings in this area to enable our members in taking the first step towards a successful marriage.
        </p>
      </div>
    </main>
  );
}
