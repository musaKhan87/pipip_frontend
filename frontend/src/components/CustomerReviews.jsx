import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Star,
  CheckCircle2,
  Bike,
  Sparkles,
  MapPin,
  ArrowRight,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "./ui/dialog";
import { Link } from "react-router-dom";

// Video stories for Vertical Upward Marquee (Down to Up)
const videoStories = [
  {
    id: "vid-1",
    author: "Riya & Kabir",
    city: "Marine Drive, Colaba",
    bike: "Suzuki Burgman 125",
    thumbnail:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    quote: "Marine Drive sunset cruise. Clean helmets, smooth engine, no hidden charges. Absolute lifesaver!",
    duration: "1:45 min",
  },
  {
    id: "vid-2",
    author: "Kunal Deshmukh",
    city: "Bandra Kurla Complex",
    bike: "Honda Activa 6G",
    thumbnail:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    quote: "Site visits made 3x faster in BKC. No cab surge pricing during peak morning hours!",
    duration: "1:15 min",
  },
  {
    id: "vid-3",
    author: "Chloe & Sameer",
    city: "Worli Sea Face",
    bike: "Royal Enfield Hunter 350",
    thumbnail:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    quote: "Worli Sea Face coastal cruise on Enfield. Tyres in mint condition, clean dual helmets.",
    duration: "2:05 min",
  },
  {
    id: "vid-4",
    author: "Aarav Mehta",
    city: "Bandra West",
    bike: "Royal Enfield Classic 350",
    thumbnail:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    quote: "Sunday morning ride to Gateway of India and Marine Drive hit different on a Royal Enfield.",
    duration: "1:30 min",
  },
  {
    id: "vid-5",
    author: "Tanvi Patil",
    city: "Matunga & Dadar",
    bike: "Honda Dio 125",
    thumbnail:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    quote: "Picked up in 2 minutes right outside the station. Student friendly with ₹200 token booking!",
    duration: "1:20 min",
  },
  {
    id: "vid-6",
    author: "Farhan Qureshi",
    city: "Lower Parel & Sea Link",
    bike: "Honda Activa 125",
    thumbnail:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    quote: "Buttery smooth engine on the sea link. No breakdown, clean papers, no drama!",
    duration: "1:50 min",
  },
];

// Text reviews Track 1 (Right to Left Horizontal Marquee)
const textReviewsRow1 = [
  {
    id: "rev-1",
    author: "Aman Shaikh",
    role: "Daily Commuter",
    city: "Bandra West",
    bike: "Honda Activa 6G",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    quote:
      "Bhai, zero security deposit drama! Paid ₹200 token online, picked up Activa near Bandra station in 2 minutes. Dropped it after 3 days and deposit refund was on my GPay within 10 minutes.",
    rating: 5,
  },
  {
    id: "rev-2",
    author: "Rahul Kulkarni",
    role: "Software Engineer",
    city: "Powai",
    bike: "TVS Jupiter 125",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
    quote:
      "Pickup person at Kurla was super polite. Helmet was clean and smelling fresh, not like other rental places. Deposit already refunded. 10/10!",
    rating: 5,
  },
  {
    id: "rev-3",
    author: "Vikram Malhotra",
    role: "Senior Consultant",
    city: "BKC Mumbai",
    bike: "Suzuki Burgman 125",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    quote:
      "Saved at least 2.5 hours of Mumbai local train rush every single day in BKC. Bike gave 52 kmpl mileage. Best commute decision ever.",
    rating: 5,
  },
  {
    id: "rev-4",
    author: "Tanvi Patil",
    role: "Student, VJTI",
    city: "Matunga",
    bike: "Honda Dio 125",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    quote:
      "Student friendly! Only ₹200 upfront token booking. As a college student at VJTI, this is the most affordable way to travel for college fests and internships.",
    rating: 5,
  },
  {
    id: "rev-5",
    author: "Neha Kulkarni",
    role: "Marketing Lead",
    city: "Andheri East",
    bike: "Honda Activa 125",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    quote:
      "WhatsApp support responded in 30 seconds when I requested to extend my rental by 2 days. Truly impressive, seamless service.",
    rating: 5,
  },
];

// Text reviews Track 2 (Right to Left Horizontal Marquee - Fast)
const textReviewsRow2 = [
  {
    id: "rev-6",
    author: "Farhan Qureshi",
    role: "Architect",
    city: "Dadar West",
    bike: "Royal Enfield Classic 350",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
    quote:
      "Rented Royal Enfield for a weekend ride to Marine Drive and sea face. Paperwork took literally 60 seconds on phone. Butter smooth on the sea link!",
    rating: 5,
  },
  {
    id: "rev-7",
    author: "Ananya Rao",
    role: "Content Creator",
    city: "Colaba",
    bike: "Honda Dio",
    avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=120&q=80",
    quote:
      "Instant WhatsApp booking confirmation and ₹200 token booking is the gold standard for bike rentals in Mumbai. Will rent every week!",
    rating: 5,
  },
  {
    id: "rev-8",
    author: "Pooja Sharma",
    role: "Product Designer",
    city: "Powai Lake",
    bike: "Honda Activa 6G",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    quote:
      "Transparent pricing, zero hidden charges. Helmet was sanitized and scooter was delivered in top condition. Deposit was refunded immediately.",
    rating: 5,
  },
  {
    id: "rev-9",
    author: "Dmitri Woodhouse",
    role: "Financial Analyst",
    city: "Lower Parel",
    bike: "Suzuki Burgman",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    quote:
      "Rented for a week-long business visit. No hassle of buying or paying auto surges. Effortless commute through Mumbai traffic.",
    rating: 5,
  },
  {
    id: "rev-10",
    author: "Aditya Verma",
    role: "Tech Founder",
    city: "Malad West",
    bike: "Royal Enfield Hunter 350",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80",
    quote:
      "Deposit refunded within 15 minutes of vehicle handover. Clean bikes and super polite staff. Pipip is miles ahead of others.",
    rating: 5,
  },
];

export default function CustomerReviews() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(25);

  const videoCol1 = videoStories.slice(0, 3);
  const videoCol2 = videoStories.slice(3, 6);

  useEffect(() => {
    let interval;
    if (selectedVideo && isPlaying) {
      interval = setInterval(() => {
        setVideoProgress((prev) => (prev >= 100 ? 0 : prev + 1.2));
      }, 250);
    }
    return () => clearInterval(interval);
  }, [selectedVideo, isPlaying]);

  return (
    <section id="reviews" className="py-24 md:py-36 relative overflow-hidden bg-background">
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/3 w-[650px] h-[500px] bg-gradient-to-bl from-teal-500/10 via-blue-500/10 to-transparent rounded-full blur-[150px] pointer-events-none" />

      {/* Grid Dot Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />

      <div className="container mx-auto px-4 relative z-10 space-y-24 md:space-y-36">

        {/* PART 1: Vertical Upward Floating Marquee (PandaPay style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Social Proof */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 border border-primary/30 text-primary text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-500/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>Real Rider Reels</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.08] font-display"
            >
              Caring is sharing.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-muted-foreground text-sm sm:text-base leading-relaxed"
            >
              At Pipip, we believe you can't get too much of a good thing... like effortless, dependable riding across Mumbai. Don't take our word for it, see what our riders have captured on the road.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="pt-2 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-foreground text-sm">4.9 / 5.0</span>
                <span className="text-muted-foreground text-xs">(2,500+ Verified Mumbai Ratings)</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-foreground shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  ₹200 Token Booking
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-emerald-500 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Zero Deposit Lock
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="pt-2"
            >
              <Link
                to="/catalog"
                className="gradient-sunset text-white font-bold text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Rent a Scooter Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: 2 Staggered Vertical Marquee Columns Floating DOWN TO UP */}
          <div className="lg:col-span-7 relative h-[560px] sm:h-[640px] overflow-hidden rounded-3xl border border-border/80 bg-card/40 backdrop-blur-md p-3 sm:p-5 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background via-background/85 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/85 to-transparent pointer-events-none z-10" />

            <div className="grid grid-cols-2 gap-3 sm:gap-5 h-full">
              {/* Column 1: Upward Marquee */}
              <div className="overflow-hidden h-full">
                <div className="animate-marquee-up-1 pause-on-hover flex flex-col gap-4 sm:gap-5">
                  {[...videoCol1, ...videoCol1].map((story, idx) => (
                    <VerticalVideoCard
                      key={`col1-${idx}`}
                      story={story}
                      onOpen={setSelectedVideo}
                    />
                  ))}
                </div>
              </div>

              {/* Column 2: Upward Marquee */}
              <div className="overflow-hidden h-full">
                <div className="animate-marquee-up-2 pause-on-hover flex flex-col gap-4 sm:gap-5">
                  {[...videoCol2, ...videoCol2].map((story, idx) => (
                    <VerticalVideoCard
                      key={`col2-${idx}`}
                      story={story}
                      onOpen={setSelectedVideo}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* PART 2: Horizontal Right-to-Left Floating Marquee (Postcards style) */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center"
            >
              <span className="text-gradient-sunset font-display font-black text-4xl sm:text-6xl">
                15,000+
              </span>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-4xl font-black text-foreground tracking-tight font-display"
            >
              riders love renting with Pipip
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-muted-foreground text-xs sm:text-sm"
            >
              Hover on any card to pause and read real Mumbai stories.
            </motion.p>
          </div>

          <div className="relative overflow-hidden py-4 -mx-4 sm:-mx-8">
            <div className="absolute inset-y-0 left-0 w-16 sm:w-36 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-16 sm:w-36 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

            {/* Track 1: Moving Right to Left */}
            <div className="flex gap-4 sm:gap-6 animate-marquee-left pause-on-hover w-max mb-5 sm:mb-6">
              {[...textReviewsRow1, ...textReviewsRow1].map((review, idx) => (
                <HorizontalReviewCard key={`track1-${idx}`} review={review} />
              ))}
            </div>

            {/* Track 2: Moving Right to Left (Faster) */}
            <div className="flex gap-4 sm:gap-6 animate-marquee-left-fast pause-on-hover w-max">
              {[...textReviewsRow2, ...textReviewsRow2].map((review, idx) => (
                <HorizontalReviewCard key={`track2-${idx}`} review={review} />
              ))}
            </div>
          </div>
        </div>

        {/* Live Mumbai Activity Strip */}
        <div className="pt-8 border-t border-border/40">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Mumbai Activity:</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
              <span>🛵 Activa 6G picked up at Bandra West (2m ago)</span>
              <span>•</span>
              <span>⭐ 5.0 rated in Powai</span>
              <span>•</span>
              <span>🏍️ Hunter 350 rented in Colaba</span>
            </div>
            <Link
              to="/catalog"
              className="text-primary hover:text-primary/80 font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              Explore Fleet <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Video Story Modal with Interactive Simulated Player */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-card border-border shadow-2xl">
          {selectedVideo && (
            <div>
              <div className="relative aspect-video w-full bg-black overflow-hidden group">
                <img
                  src={selectedVideo.thumbnail}
                  alt={selectedVideo.author}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isPlaying ? "scale-105 opacity-90" : "scale-100 opacity-75"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30 flex flex-col justify-between p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                      <Bike className="w-3.5 h-3.5 text-primary" />
                      {selectedVideo.bike}
                    </span>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-sunset text-white shadow-2xl shadow-orange-500/50 hover:scale-110 active:scale-95 transition-all"
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7 fill-current" />
                      ) : (
                        <Play className="w-7 h-7 fill-current ml-1" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/90">
                      <p className="font-semibold line-clamp-1">{selectedVideo.quote}</p>
                      <span className="font-mono text-white/70">{selectedVideo.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{selectedVideo.author}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      {selectedVideo.city}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Trip
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                  "{selectedVideo.quote}"
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Rented via Pipip Mumbai</span>
                  <Link
                    to="/catalog"
                    onClick={() => setSelectedVideo(null)}
                    className="gradient-sunset text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 hover:scale-105 transition-all inline-flex items-center gap-1.5"
                  >
                    <span>Book This Ride</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

// Vertical Video Card (Down-to-Up float)
function VerticalVideoCard({ story, onOpen }) {
  return (
    <div
      onClick={() => onOpen(story)}
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[3/4] bg-card border border-border/80 hover:border-primary/80 transition-all duration-300 hover:scale-[1.02] cursor-pointer group shadow-lg shadow-black/20"
    >
      <img
        src={story.thumbnail}
        alt={story.author}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 group-hover:from-black/95 transition-colors" />

      {/* Radar Play Button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-blue-500 opacity-60" />
          <div className="relative w-11 h-11 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-600/50 group-hover:scale-110 group-hover:bg-primary transition-all">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono border border-white/10">
        {story.duration}
      </span>

      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-white">
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-amber-300 bg-black/50 backdrop-blur-md border border-white/10 mb-1">
          {story.bike}
        </span>
        <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1">{story.author}</h4>
        <p className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5 truncate">
          <MapPin className="w-3 h-3 text-primary shrink-0" />
          {story.city}
        </p>
      </div>
    </div>
  );
}

// Horizontal Review Card (Right-to-Left float)
function HorizontalReviewCard({ review }) {
  return (
    <div className="w-[300px] sm:w-[360px] bg-card/90 dark:bg-card/85 backdrop-blur-md border border-border/80 hover:border-primary/60 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl shadow-black/10 flex flex-col justify-between shrink-0 group">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <img
            src={review.avatar}
            alt={review.author}
            className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {review.author}
              </h5>
              <div className="flex text-amber-500 shrink-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {review.role} • {review.city}
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-[13px] text-foreground/90 leading-relaxed font-normal line-clamp-4">
          "{review.quote}"
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1 font-semibold text-primary">
          <Bike className="w-3 h-3" />
          {review.bike}
        </span>
        <span className="text-emerald-500 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Verified
        </span>
      </div>
    </div>
  );
}
