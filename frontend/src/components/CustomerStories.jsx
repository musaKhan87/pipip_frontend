import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Sparkles, CheckCircle2 } from "lucide-react";

// Real customer stories with authentic varying lengths and Mumbai Pipip context
const baseStories = [
  {
    id: 1,
    author: "Saurabh",
    platform: "Apple App Store",
    location: "Andheri East Hub",
    bike: "Honda Activa 6G",
    text: "Came across Pipip while searching for bike rentals in Mumbai. App is clean and through the point and was very easy to setup and create an account and choose bikes and book. Special mention for contact us section which lead to reaching out to customer support and was very promptly helped by Stijin, who helped with all queries and processed the booking in a breeze. Definitely a good overall experience.",
  },
  {
    id: 2,
    author: "Donapti Manohar Reddy",
    platform: "Google Play Store",
    location: "Bandra West Hub",
    bike: "Royal Enfield Meteor 350",
    text: "Paulleo did an excellent job fixing the issue, addressing both the self-start problem by changing the battery and resolving some tuning issues. Now, the self-start is working fine, and the bike starts with a single kick, all within a remarkable five minutes. His great service left me genuinely impressed.",
  },
  {
    id: 3,
    author: "Syed Imran",
    platform: "Google Play Store",
    location: "Dadar Central Hub",
    bike: "Suzuki Access 125",
    text: "This app was very useful for 2 - 3 days who know how to ride and has a valid license. Very budget friendly with the ₹200 token reservation and good customer support.",
  },
  {
    id: 4,
    author: "Kausal Benarjee",
    platform: "Google Play Store",
    location: "Wadala Hub",
    bike: "Honda Activa 125",
    text: "Very reliable motorbikes and awesome customer support are guaranteed. Customer service is spot on. Denzil has helped me very patiently to go over the terms and conditions. Definitely rent from Pipip again.",
  },
  {
    id: 5,
    author: "Akshay Kumar",
    platform: "Google Play Store",
    location: "Marine Drive / Colaba Hub",
    bike: "Suzuki Burgman 125",
    text: "Vehicle was in very good condition and all the staff was very humble. Our vehicle got punctured near Marine Drive but we got full replacement assistance within 25 minutes after contacting their staff. We also got the deposit refund instantly on UPI. Absolutely reliable in Mumbai.",
  },
  {
    id: 6,
    author: "Yathi Premlal",
    platform: "Google Play Store",
    location: "Airport Hub (T1/T2)",
    bike: "Royal Enfield Hunter 350",
    text: "Hello all, I had booked a bike for 14th Oct. Just then I noticed I booked for the wrong date and my ride will start in an 1 hrs time. I reached out to Pipip to see if there is anyhow I can get this fixed. In a flash they had my concern fixed and ready to move on. I was assisted in rescheduling with zero penalties. Thank you Pipip — you guys are doing great stuff!",
  },
  {
    id: 7,
    author: "Dipti Rekha",
    platform: "Apple App Store",
    location: "Thane Hub",
    bike: "Honda Dio 125",
    text: "Kevin was very helpful and supportive and assisted with every process of booking the vehicle. It was a great experience with Pipip rental bikes. The ₹200 token reservation made it super easy to lock the bike without risking huge advances.",
  },
  {
    id: 8,
    author: "Sai Manikanta Gududru",
    platform: "Google Play Store",
    location: "Ghatkopar Hub",
    bike: "Honda Activa 6G",
    text: "Thank you for delivering wonderful service, its a great help for students like me who wants to travel in cities on bike and every problem will be resolved by contacting the customer care. Thank you team for your valuable customer service. Hope all enjoy the service with minimal fee.",
  },
];

// Helper to create repeating cycles with persistent stable keys
const createCycles = (startCycle, cycleCount) => {
  const list = [];
  for (let c = 0; c < cycleCount; c++) {
    const cycleNum = startCycle + c;
    for (let i = 0; i < baseStories.length; i++) {
      list.push({
        ...baseStories[i],
        virtualId: `cycle-${cycleNum}-item-${baseStories[i].id}`,
      });
    }
  }
  return list;
};

// Safe initial visible count based on screen width
const getInitialVisibleCount = () => {
  if (typeof window !== "undefined") {
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
  }
  return 3;
};

export default function CustomerStories() {
  // Start with 10 repeating cycles (80 cards) so user can scroll indefinitely
  const [cycleOffset, setCycleOffset] = useState(0);
  const [storyList, setStoryList] = useState(() => createCycles(0, 10));
  
  // Start in Cycle 3 (index 24) so there is plenty of room forward and backward
  const [currentIndex, setCurrentIndex] = useState(24);
  const [visibleCount, setVisibleCount] = useState(getInitialVisibleCount);
  const [containerWidth, setContainerWidth] = useState(1150);
  const containerRef = useRef(null);

  // Touch swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  // Responsive layout tracking
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        if (width < 640) {
          setVisibleCount(1);
        } else if (width < 1024) {
          setVisibleCount(2);
        } else {
          setVisibleCount(3);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const ro = new ResizeObserver(handleResize);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
    };
  }, []);

  const isMobile = visibleCount === 1;
  const cardGap = isMobile ? 18 : visibleCount === 2 ? 36 : 48;

  // Exact card width calculation
  const cardWidth =
    containerWidth > 0
      ? isMobile
        ? Math.min(containerWidth - 52, 350)
        : Math.floor((containerWidth - (visibleCount - 1) * cardGap) / visibleCount)
      : 340;

  // On mobile: center offset so the active card is centered in the viewport
  const centerOffset = isMobile ? Math.max(0, (containerWidth - cardWidth) / 2) : 0;

  // Infinite expansion: append more cycles when user gets near the end
  const handleNext = () => {
    setCurrentIndex((prev) => {
      const nextIdx = prev + 1;
      // If we are within 12 cards of the end, append 5 more cycles (40 cards)
      if (nextIdx >= storyList.length - 12) {
        setStoryList((curr) => [
          ...curr,
          ...createCycles(cycleOffset + 10, 5),
        ]);
        setCycleOffset((c) => c + 5);
      }
      return nextIdx;
    });
  };

  // Infinite expansion: handle previous
  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  // Touch Swipe with natural scroll detection (avoids blocking vertical scrolling)
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
    const diffX = Math.abs(touchEndX.current - touchStartX.current);
    const diffY = Math.abs(e.targetTouches[0].clientY - touchStartY.current);

    if (diffX > diffY && diffX > 12) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
    isSwiping.current = false;
  };

  // Smooth easing for carousel translation
  const smoothTransition = {
    duration: 0.6,
    ease: [0.25, 1, 0.5, 1],
  };

  // Wave vertical displacement (only on desktop/tablet, strictly 0 on mobile)
  const downOffset = 52; // px

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] relative overflow-hidden border-t border-slate-200/80 select-none">
      {/* Subtle Ambient Radial Glows Matching Pipip Theme */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[350px] bg-amber-400/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[350px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ======================================================== */}
        {/* SECTION HEADER (Blended into Pipip Theme)                */}
        {/* ======================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-300/40 text-xs font-black mb-3.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>REAL STORIES • VERIFIED RIDERS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-3xl sm:text-5xl lg:text-[54px] font-display font-black tracking-tight text-slate-900 leading-[1.15]"
          >
            What our users have to <span className="text-amber-400">say</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-xs sm:text-sm text-slate-500 mt-2.5 max-w-lg mx-auto font-normal leading-relaxed"
          >
            Authentic feedback from verified riders renting across Mumbai on Play Store & App Store.
          </motion.p>
        </div>

        {/* ======================================================== */}
        {/* CAROUSEL VIEWPORT CONTAINER                              */}
        {/* ======================================================== */}
        <div
          className="relative max-w-6xl mx-auto touch-pan-y"
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Edge Blur Fog Masks on Desktop */}
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent z-20 pointer-events-none" />
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent z-20 pointer-events-none" />

          {/* Overflow Clip with clearance for top quote and offset yellow frame */}
          <div className="overflow-hidden pt-10 pb-16 px-4 -mx-4">
            <motion.div
              animate={{
                x: centerOffset - currentIndex * (cardWidth + cardGap),
              }}
              transition={smoothTransition}
              className="flex items-start will-change-transform"
              style={{
                gap: `${cardGap}px`,
              }}
            >
              {storyList.map((story, index) => {
                // Wave calculation for desktop:
                // Slot 0 (left) = DOWN (52px)
                // Slot 1 (middle) = UP (0px)
                // Slot 2 (right) = DOWN (52px)
                const relativeSlot = index - currentIndex;
                const isEvenSlot = Math.abs(relativeSlot) % 2 === 0;

                // ON MOBILE: strictly 0 (never animate Y, eliminates all vertical jumpiness)
                // ON DESKTOP: alternate between 0 and 52px
                const targetY = isMobile ? 0 : isEvenSlot ? downOffset : 0;

                return (
                  <motion.div
                    key={story.virtualId}
                    animate={{
                      y: targetY,
                    }}
                    transition={isMobile ? { duration: 0 } : smoothTransition}
                    style={{
                      width: `${cardWidth}px`,
                    }}
                    className="shrink-0 will-change-transform"
                  >
                    {/* Double-layered Card Box */}
                    <div className="relative group">
                      
                      {/* 1. Golden Amber Quotation Mark Perched Above Card */}
                      <div className="absolute -top-7 sm:-top-8 left-3 z-20 pointer-events-none select-none">
                        <span className="text-amber-400 font-serif text-5xl sm:text-6xl font-black leading-none drop-shadow-xs">
                          “
                        </span>
                      </div>

                      {/* 2. Offset Yellow Outline Frame Behind Card */}
                      {/* Dynamically matches individual card height */}
                      <div className="absolute inset-0 translate-x-3.5 translate-y-3.5 sm:translate-x-4 sm:translate-y-4 rounded-2xl border-2 border-amber-400 pointer-events-none transition-transform duration-300 group-hover:translate-x-5 group-hover:translate-y-5" />

                      {/* 3. Foreground Elevated White Card (Height naturally fits comment length) */}
                      <div className="relative z-10 bg-white rounded-2xl p-5 sm:p-7 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06)] border border-slate-100/90 flex flex-col justify-between transition-all duration-300 group-hover:shadow-[0_20px_45px_-8px_rgba(15,23,42,0.12)]">
                        
                        {/* Quote Text - dynamic height based on text content */}
                        <p className="text-xs sm:text-[13.5px] text-slate-700 leading-relaxed font-normal mb-5">
                          {story.text}
                        </p>

                        {/* Card Footer: Author, Vehicle, Verified Badge, Stars */}
                        <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight font-sans">
                                {story.author}
                              </h4>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            </div>
                            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                              {story.platform} • <span className="text-slate-500 font-medium">{story.bike}</span>
                            </p>
                          </div>

                          {/* 5 Amber Stars */}
                          <div className="flex text-amber-400 gap-0.5 shrink-0 pb-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* ======================================================== */}
          {/* NAVIGATION ARROW CONTROLS (Only < and >, No Center Part) */}
          {/* ======================================================== */}
          <div className="flex items-center justify-center gap-4 mt-6 sm:mt-10">
            {/* Prev Arrow (<) */}
            <button
              onClick={handlePrev}
              aria-label="Previous story"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-800 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Next Arrow (>) */}
            <button
              onClick={handleNext}
              aria-label="Next story"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-800 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
