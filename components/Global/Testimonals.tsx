'use client';
import React from 'react';
import Image from 'next/image';
import { Star, MessageSquare } from 'lucide-react';

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?u=a042581f4e29026024d";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

const testimonials = [
  {
    id: 1,
    type: 'quote',
    text: "Sodales ut etiam sit amet nisl. Semper feugiat nibh sed pulvinar proin amet nulla morbi eu non gravida",
    author: "James Brown",
    role: "CEO Design Company - @YourHashtag",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    id: 2,
    type: 'avatar-top',
    title: "I really appreciate!!",
    text: "Congue mauris rhoncus deaenean vel elit Morbi non arcu risus quis varius Tincidunt augue interdum velit euismod",
    author: "Hindley Earnshaw",
    role: "@Hindley.Es",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    largeQuoteRight: true,
  },
  {
    id: 3,
    type: 'large-photo',
    text: "Morbi non arcu risus quis varius. Tincidunt augue interdum velit euismod",
    signature: "Linda Brown",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    type: 'avatar-top',
    title: "Good Job!",
    text: "Semper feugiat nibh sed pulvinar proin gravida facilisi morbi tempus iaculis pharetra convallis posuere fermentum iaculis facilisi morbi",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
    centerAlign: true,
  },
  {
    id: 5,
    type: 'standard',
    text: "Eget mauris pharetra et ultrices neque ornare. Leo integer malesuada nunc sit vel. A arcu cursus vitae congue mauris rhoncus aenean vel elit. Morbi non arcu risus quis varius. Tincidunt augue interdum velit euismod. Semper feugiat nibh sed pulvinar proin gravida.",
    author: "Victoria Wotton",
    role: "Fermentum Odio Co.",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
  },
  {
    id: 6,
    type: 'photo-side',
    text: "Consequat Sit amet nulla facilisi morbi tempus iaculis. Nullam vehicula ipsum a arcu cursus. Pretium vulputate sapien nec sagittis aliquam",
    title: "Cras fermentum odio eu feugiat pretium nibh nulla a sit",
    author: "Henry Vane",
    role: "Fermentum Co.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 7,
    type: 'speech-bubble',
    title: "I was very impressed!",
    text: "Diam maecenas ultricies mi eget. In nulla posuere sollicitudin aliquam. Adipiscing enim eu turpis egestas pretium aenean. Vitae ultricies leo integer malesuada nunc vel.",
    author: "Wilkins Micawber",
    avatars: [
      "https://i.pravatar.cc/150?u=1",
      "https://i.pravatar.cc/150?u=2",
      "https://i.pravatar.cc/150?u=3"
    ]
  },
  {
    id: 8,
    type: 'avatar-top',
    text: "Sodales ut etiam sit amet nisl. Semper feugiat nibh sed pulvinar proin amet nulla morbi eu non gravida",
    rating: 5,
    signature: "Isabella Linton",
    avatar: "https://i.pravatar.cc/150?u=4",
    centerAlign: true,
    isSpeechBubble: true,
  },
  {
    id: 9,
    type: 'standard-right-author',
    text: "Enim lobortis scelerisque fermentum dui faucibus. Sodales ut etiam sit amet nisl. Semper feugiat nibh sed pulvinar proin gravida facilisi morbi tempus iaculis pharetra convallis posuere morbi leo urna",
    author: "Basil Hallward",
    role: "Co-Founder Gravida.com",
    avatar: "https://i.pravatar.cc/150?u=5",
  }
];

export default function Testimonals() {
  return (
    <section className="py-24 bg-[#eef0f4] w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3efff] text-[#7c4dff] w-fit mb-6">
            <MessageSquare size={14} className="text-[#7c4dff]" />
            <span className="text-xs font-semibold tracking-wide">Testimonials</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mb-6 leading-tight">
            Loved by <span className="text-[#7c4dff]">thousands</span>
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl">
            See what our customers are saying about our platform and how it has helped them grow their business.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {testimonials.map((item) => {
            
            // Standard Card with Author at Bottom Left
            if (item.type === 'standard') {
              return (
                <div key={item.id} className="bg-white rounded-3xl p-8 shadow-sm break-inside-avoid relative">
                  <p className="text-gray-600 text-sm leading-relaxed mb-8">
                    {item.text}
                  </p>
                  <div className="flex items-center gap-4">
                    <Image src={item.avatar ?? DEFAULT_AVATAR} alt={item.author ?? "Testimonial"} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{item.author}</span>
                      <span className="text-xs text-[#7c4dff]">{item.role}</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Card with Quote Icon at Top Left
            if (item.type === 'quote') {
              return (
                <div key={item.id} className="bg-white rounded-3xl p-8 shadow-sm break-inside-avoid relative mt-4">
                  <div className="absolute -top-6 -left-2 text-[80px] leading-none text-gray-800 font-serif rotate-180">
                    &ldquo;
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8 pt-4">
                    {item.text}
                  </p>
                  <div className="flex items-center gap-4">
                    <Image src={item.avatar ?? DEFAULT_AVATAR} alt={item.author ?? "Testimonial"} width={48} height={48} className="w-12 h-12 rounded-full border-4 border-gray-100 object-cover" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{item.author}</span>
                      <span className="text-[10px] text-[#7c4dff]">{item.role}</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Avatar overlapping top edge
            if (item.type === 'avatar-top') {
              return (
                <div key={item.id} className={`bg-white rounded-3xl p-8 shadow-sm break-inside-avoid relative mt-12 ${item.centerAlign ? 'text-center' : ''} ${item.isSpeechBubble ? 'rounded-bl-none' : ''}`}>
                  <div className={`absolute -top-10 ${item.centerAlign ? 'left-1/2 -translate-x-1/2' : 'left-8'}`}>
                    <Image src={item.avatar ?? DEFAULT_AVATAR} alt={item.author ?? item.signature ?? "Testimonial"} width={80} height={80} className="w-20 h-20 rounded-full border-8 border-[#eef0f4] object-cover bg-white" />
                  </div>
                  <div className="pt-8">
                    {item.rating && (
                      <div className={`flex gap-1 mb-4 ${item.centerAlign ? 'justify-center' : ''}`}>
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} size={18} className="fill-[#ffd700] text-[#ffd700]" />
                        ))}
                      </div>
                    )}
                    {item.title && <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>}
                    <p className={`text-gray-600 text-sm leading-relaxed ${item.largeQuoteRight ? 'mb-8' : 'mb-4'}`}>
                      {item.text}
                    </p>
                    
                    {item.author && (
                      <div className={`flex flex-col ${item.centerAlign ? 'items-center' : 'items-start'}`}>
                        <span className="text-sm font-semibold text-gray-900">{item.author}</span>
                        <span className="text-xs text-[#7c4dff]">{item.role}</span>
                      </div>
                    )}
                    
                    {item.signature && (
                      <div className="font-['Brush_Script_MT',cursive] text-2xl text-gray-400 mt-4">
                        {item.signature}
                      </div>
                    )}

                    {item.largeQuoteRight && (
                      <div className="absolute -bottom-10 right-4 text-[100px] leading-none text-gray-800 font-serif">
                        &ldquo;
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Large Vertical Photo Card
            if (item.type === 'large-photo') {
              return (
                <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm break-inside-avoid">
                  <Image src={item.image ?? DEFAULT_IMAGE} alt="Testimonial" width={400} height={256} className="w-full h-64 object-cover rounded-2xl mb-6" />
                  <div className="px-2 pb-2">
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 text-center">
                      {item.text}
                    </p>
                    <div className="text-center font-['Brush_Script_MT',cursive] text-3xl text-gray-400">
                      {item.signature}
                    </div>
                  </div>
                </div>
              );
            }

            // Photo Side (Horizontal inside column, though column limits width)
            // We can style it to have image left, text right if wide enough, or stack
            if (item.type === 'photo-side') {
              return (
                <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm break-inside-avoid">
                  <div className="flex gap-4 mb-4 items-start">
                    <Image src={item.image ?? DEFAULT_IMAGE} alt={item.author ?? "Testimonial"} width={80} height={80} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    <div>
                      <div className="text-4xl font-serif text-gray-900 leading-none mb-2">&ldquo;</div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed mb-4">
                    {item.text}
                  </p>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-gray-900">{item.author} <span className="text-[#7c4dff] font-normal">- {item.role}</span></span>
                  </div>
                </div>
              );
            }

            // Wide Speech Bubble Card
            if (item.type === 'speech-bubble') {
              return (
                <div key={item.id} className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 shadow-sm break-inside-avoid relative mb-8">
                  <div className="absolute -bottom-4 left-20 w-8 h-8 bg-white rotate-45 transform origin-top-left"></div>
                  <div className="text-center max-w-xl mx-auto">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed mb-8">
                      {item.text}
                    </p>
                    <div className="text-xs font-semibold text-gray-900 mb-6">{item.author}</div>
                  </div>
                  {item.avatars && (
                    <div className="absolute -bottom-16 left-4 flex gap-2">
                      {item.avatars.map((av, idx) => (
                        <div key={idx} className={`rounded-full p-1 bg-[#eef0f4] ${idx === 1 ? 'w-16 h-16' : 'w-12 h-12 mt-2'}`}>
                          <Image src={av} alt="Avatar" width={48} height={48} className="w-full h-full rounded-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Standard Right Author
            if (item.type === 'standard-right-author') {
              return (
                <div key={item.id} className="bg-white rounded-3xl p-8 shadow-sm break-inside-avoid relative">
                  <p className="text-gray-600 text-sm leading-relaxed mb-8">
                    &ldquo;{item.text}&rdquo;
                  </p>
                  <div className="flex flex-col items-center">
                    <Image src={item.avatar ?? DEFAULT_AVATAR} alt={item.author ?? "Testimonial"} width={64} height={64} className="w-16 h-16 rounded-full object-cover mb-3 bg-[#eef0f4] p-1" />
                    <span className="text-sm font-semibold text-gray-900">{item.author}</span>
                    <span className="text-xs text-[#7c4dff]">{item.role}</span>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </section>
  );
}
