import React from 'react';

const featuresList = [
  {
    badge: '100%',
    badgeBg: 'bg-red-50 text-[#e53238]',
    title: 'Verified Profiles',
    description:
      'Every profile is manually screened and phone-verified to ensure a safe, authentic matchmaking experience.',
  },
  {
    badge: 'AI',
    badgeBg: 'bg-cyan-50 text-[#00aed6]',
    title: 'Smart Matchmaking',
    description:
      'Intelligent matchmaking algorithms connect compatible partners based on shared values, lifestyle, and preferences.',
  },
  {
    badge: '🔒',
    badgeBg: 'bg-red-50 text-[#e53238]',
    title: '100% Privacy Control',
    description:
      'Flexible privacy controls let you decide exactly who can view your photo, phone number, and personal contact details.',
  },
];

export default function Features() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50/50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Why Millions Choose Our <span className="text-[#e53238]">Matrimony</span> Platform
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600">
            Built with trust, safety, and modern matchmaking technology to help you find your life partner smoothly.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresList.map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white shadow-sm border border-gray-100/80 hover:shadow-xl hover:border-red-100 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between group"
            >
              <div>
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.badgeBg} flex items-center justify-center font-black text-xl mb-6 shadow-2xs group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.badge}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#e53238] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
