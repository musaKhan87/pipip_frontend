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
    quote: "Marine Drive sunset cruise. Clean helmet, smooth engine, no hidden charges. Absolute lifesaver!",
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
    quote: "Worli Sea Face coastal cruise on Enfield. Tyres in mint condition, clean sanitized helmet.",
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
    author: "HIMANSHU YADAV",
    initials: "HY",
    avatarBg: "bg-lime-100 text-lime-900 border-lime-200",
    hub: "Wadala East Hub",
    date: "Jun 21, 2026",
    rating: 5.0,
    quote: "Best experience. The bike was in best condition didnt not expext it to be so perfect so yeah just loved it",
    bike: "Meteor 350 Supernova",
    days: "1 days",
  },
  {
    id: "rev-2",
    author: "DARSHAN FALDU",
    initials: "DF",
    avatarBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
    hub: "Andheri East Hub",
    date: "Jun 24, 2026",
    rating: 5.0,
    quote: "Runs like a new bike. Well maintained and smooth on highway. Quick deposit refund via UPI right after physical inspection!",
    bike: "Hunter 350 Tokyo Black",
    days: "2 days",
  },
  {
    id: "rev-3",
    author: "ANKIT SHARMA",
    initials: "AS",
    avatarBg: "bg-blue-100 text-blue-900 border-blue-200",
    hub: "Bandra West Hub",
    date: "Jun 27, 2026",
    rating: 5.0,
    quote: "Paid ₹200 token online and picked up Activa in 60 seconds. Helmet was sanitized and smelling fresh. Zero hidden charges.",
    bike: "Activa 6G Deluxe",
    days: "3 days",
  },
  {
    id: "rev-4",
    author: "ROHIT KULKARNI",
    initials: "RK",
    avatarBg: "bg-amber-100 text-amber-900 border-amber-200",
    hub: "Borivali West Hub",
    date: "Jul 02, 2026",
    rating: 5.0,
    quote: "Saved at least 2.5 hours of Mumbai rush hour every day. Scooter gave 52 kmpl mileage. Highly recommended for daily work commute.",
    bike: "Suzuki Access 125",
    days: "4 days",
  },
  {
    id: "rev-5",
    author: "VIKRAMADITYA RAO",
    initials: "VR",
    avatarBg: "bg-purple-100 text-purple-900 border-purple-200",
    hub: "Powai Hiranandani Hub",
    date: "Jul 08, 2026",
    rating: 5.0,
    quote: "Pickup staff was polite and verified documents in a minute. No hassle of massive advance payments. Loved the ₹200 token reservation.",
    bike: "Burgman Street 125",
    days: "2 days",
  },
];

// Text reviews Track 2 (Left to Right Horizontal Marquee)
const textReviewsRow2 = [
  {
    id: "rev-6",
    author: "PRAJWAL NAIK",
    initials: "PN",
    avatarBg: "bg-lime-100 text-lime-900 border-lime-200",
    hub: "Wadala East Hub",
    date: "Jun 29, 2026",
    rating: 5.0,
    quote: "Saurabh is a very friendly and helpful guy. No doubt he have such good rating. The vehicle was completely clean and full tank ready.",
    bike: "Activa 6G",
    days: "2 days",
  },
  {
    id: "rev-7",
    author: "NARENDRA KHATRI",
    initials: "NK",
    avatarBg: "bg-amber-100 text-amber-900 border-amber-200",
    hub: "Worli Sea Face Hub",
    date: "Jul 05, 2026",
    rating: 5.0,
    quote: "The bike is in superb condition and staff was polite and courteous. Butter smooth on the sea link for a weekend cruise.",
    bike: "Classic 350 Reborn",
    days: "3 days",
  },
  {
    id: "rev-8",
    author: "TANVI PATIL",
    initials: "TP",
    avatarBg: "bg-pink-100 text-pink-900 border-pink-200",
    hub: "Dadar West Hub",
    date: "Jul 11, 2026",
    rating: 5.0,
    quote: "Student friendly! Only ₹200 upfront token booking. As a college student at VJTI, this is the most affordable way to travel for college fests.",
    bike: "Honda Dio 125",
    days: "1 days",
  },
  {
    id: "rev-9",
    author: "KUNAL DESHMUKH",
    initials: "KD",
    avatarBg: "bg-cyan-100 text-cyan-900 border-cyan-200",
    hub: "Kurla West Hub",
    date: "Jul 15, 2026",
    rating: 5.0,
    quote: "Deposit was refunded to my UPI account within 10 minutes of drop-off. Cleanest bike rental service in Mumbai by far.",
    bike: "Hunter 350 Dapper Ash",
    days: "2 days",
  },
  {
    id: "rev-10",
    author: "SNEHA IYER",
    initials: "SI",
    avatarBg: "bg-indigo-100 text-indigo-900 border-indigo-200",
    hub: "Thane Station Hub",
    date: "Jul 19, 2026",
    rating: 5.0,
    quote: "WhatsApp support replied in 30 seconds when I requested to extend my rental. Super smooth, dependable, transparent pricing.",
    bike: "TVS Jupiter 125",
    days: "3 days",
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
    <section id="reviews" className="py-20 md:py-28 relative overflow-hidden bg-white border-t border-slate-200/80">
      {/* Subtle Ambient Lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-slate-100/60 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Dot Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#0f172a0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="container mx-auto px-4 relative z-10 space-y-20 md:space-y-28">

        {/* PART 1: Vertical Upward Floating Marquee (PandaPay style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Social Proof */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-800 border border-blue-300/40 text-xs font-black shadow-2xs mb-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>REAL RIDER EXPERIENCES</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] font-display"
            >
              Caring is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                Sharing.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-slate-600 text-sm sm:text-base leading-relaxed"
            >
              At Pipip, we believe effortless, dependable riding should be standard across Mumbai. Don't take our word for it — see what our riders have captured live on the road.
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
                  Refundable Security Deposit
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
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 transition-all inline-flex items-center gap-2"
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
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-300/40 text-xs font-black shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.9 / 5.0 RATED • 2,500+ VERIFIED MUMBAI RIDERS</span>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-display leading-[1.15]"
            >
              Riders Love Pipip{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                Across Mumbai
              </span>
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto"
            >
              Real stories from daily office commuters, airport travelers, and weekend explorers.
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

            {/* Track 2: Moving Left to Right */}
            <div className="flex gap-4 sm:gap-6 animate-marquee-right pause-on-hover w-max">
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
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm shadow-blue-500/20 transition-all inline-flex items-center gap-1.5"
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
      className="relative rounded-xl overflow-hidden aspect-[3/4] bg-card border border-border/80 hover:border-slate-400 transition-all duration-200 cursor-pointer group shadow-xs hover:shadow-md"
    >
      <img
        src={story.thumbnail}
        alt={story.author}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5 group-hover:from-black/90 transition-colors" />

      {/* Radar Play Button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-xs text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </div>
      </div>

      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-mono border border-white/10">
        {story.duration}
      </span>

      <div className="absolute bottom-0 inset-x-0 p-3.5 text-white">
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium text-slate-200 bg-black/50 backdrop-blur-md border border-white/10 mb-1">
          {story.bike}
        </span>
        <h4 className="font-semibold text-xs text-white line-clamp-1">{story.author}</h4>
        <p className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5 truncate">
          <MapPin className="w-3 h-3 text-white/70 shrink-0" />
          {story.city}
        </p>
      </div>
    </div>
  );
}

// Horizontal Review Card (Matches User Reference Design)
function HorizontalReviewCard({ review }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-[320px] sm:w-[380px] bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_30px_-6px_rgba(15,23,42,0.12)] flex flex-col justify-between shrink-0 group select-none cursor-default"
    >
      <div>
        {/* Top Header: Watermark Quotation Icon & Date */}
        <div className="flex items-start justify-between mb-3.5">
          {/* Elegant Quotation Mark Watermark */}
          <div className="text-slate-200 group-hover:text-emerald-500/30 transition-colors">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>

          <span className="text-xs text-slate-400 font-medium tracking-tight">
            {review.date}
          </span>
        </div>

        {/* Author Avatar, Name & Hub Location */}
        <div className="flex items-center gap-3 mb-3">
          {/* Initials Avatar Badge */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm shrink-0 border ${review.avatarBg}`}>
            {review.initials}
          </div>

          <div className="min-w-0 flex-1">
            <h5 className="font-black text-xs sm:text-sm text-slate-900 tracking-tight uppercase truncate">
              {review.author}
            </h5>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              Booked from {review.hub}
            </p>
          </div>
        </div>

        {/* 5 Solid Gold Stars + Numeric Score */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex text-amber-400 gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs font-black text-slate-800 ml-1">
            {review.rating.toFixed(1)}
          </span>
        </div>

        {/* Review Quote Text */}
        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal line-clamp-3">
          {review.quote}
        </p>
      </div>

      {/* Card Divider & Bottom Vehicle Booking Metadata */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <p className="truncate">
          Booked <span className="text-slate-800 font-semibold">{review.bike}</span> for{" "}
          <strong className="text-slate-900 font-black">{review.days}</strong>
        </p>
      </div>
    </motion.div>
  );
}
