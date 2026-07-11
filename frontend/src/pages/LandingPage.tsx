import React, { useEffect } from 'react';
import './LandingPage.css';

export default function LandingPage() {
  useEffect(() => {
    const headers = document.querySelectorAll('.landing-blueprint h3, .landing-blueprint h4');
    const addItalic = (e: any) => e.target.classList.add('italic');
    const removeItalic = (e: any) => e.target.classList.remove('italic');

    headers.forEach(header => {
      header.addEventListener('mouseenter', addItalic);
      header.addEventListener('mouseleave', removeItalic);
    });

    return () => {
      headers.forEach(header => {
        header.removeEventListener('mouseenter', addItalic);
        header.removeEventListener('mouseleave', removeItalic);
      });
    };
  }, []);

  return (
    <div className="landing-blueprint bg-background text-on-background selection:bg-secondary selection:text-white">

      <main className="max-w-container-max-width mx-auto">
        {/* HERO / INTRO SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-12 px-grid-unit md:px-section-margin py-12 md:py-20 border-b-2 border-primary">
          <div className="md:col-span-8 pr-0 md:pr-12">
            <div className="font-label-mono text-label-mono text-secondary mb-4">EDITION NO. 042 // SYSTEM BLUEPRINT</div>
            <h1 className="font-headline-xl text-headline-xl uppercase mb-8 leading-tight">Master the <span className="text-secondary italic">Auction.</span></h1>
            <p className="font-body-lg text-body-lg drop-cap mb-6">
              In the high-stakes arena of MatchMind, victory isn't found in a simple draft list. It is forged through the clinical precision of our real-time auction engine. Here, every manager is a GM, every bid is a calculated risk, and every player has a price. Our proprietary "Blueprint" system provides the architecture for the most authentic fantasy football experience ever printed in cyberspace.
            </p>
            <div className="flex gap-4">
              <button className="bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps flex items-center gap-2 hover:bg-secondary transition-colors group">
                START YOUR AUCTION <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button className="border-2 border-primary px-6 py-3 font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition-colors">
                READ THE RULES
              </button>
            </div>
          </div>
          <div className="hidden md:flex md:col-span-4 flex-col gap-6 pl-12 rule-l">
            <div className="rule-b pb-6">
              <div className="font-label-mono text-label-mono text-secondary uppercase text-[10px] mb-2">Live Now</div>
              <h3 className="font-headline-sm text-headline-sm mb-1">UEFA Europa League 2026/27</h3>
              <p className="font-label-mono text-label-mono text-on-surface-variant uppercase">UEFA • 36 TEAMS</p>
            </div>
            <div className="rule-b pb-6">
              <div className="font-label-mono text-label-mono text-outline-variant uppercase text-[10px] mb-2">Announced</div>
              <h3 className="font-headline-sm text-headline-sm mb-1">CAF Africa Cup of Nations PAMOJA 2027</h3>
              <p className="font-label-mono text-label-mono text-on-surface-variant uppercase">CAF • 24 TEAMS</p>
            </div>
            <div>
              <div className="font-label-mono text-label-mono text-outline-variant uppercase text-[10px] mb-2">Announced</div>
              <h3 className="font-headline-sm text-headline-sm mb-1">FIFA Women's World Cup Brazil 2027</h3>
              <p className="font-label-mono text-label-mono text-on-surface-variant uppercase">FIFA • 32 TEAMS</p>
            </div>
          </div>
        </section>

        {/* LIVE TICKER */}
        <div className="ticker-wrap py-2 border-b-2 border-primary">
          <div className="ticker font-label-mono text-label-mono text-on-primary uppercase flex gap-12 w-max">
            <span><span className="text-secondary">●</span> LIVE STATS</span>
            <span>3 TOURNAMENTS</span>
            <span>500+ PLAYERS TO DRAFT</span>
            <span>1000+ ACTIVE MANAGERS</span>
            <span>2 SUPPORTED LEAGUES</span>
            <span><span className="text-secondary">●</span> LIVE STATS</span>
            <span>3 TOURNAMENTS</span>
            <span>500+ PLAYERS TO DRAFT</span>
            <span>1000+ ACTIVE MANAGERS</span>
            <span>2 SUPPORTED LEAGUES</span>
          </div>
        </div>

        {/* THE BLUEPRINT SECTION */}
        <section className="bg-primary text-on-primary px-grid-unit md:px-section-margin py-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-on-primary-container pb-4">
            <h2 className="font-headline-xl text-headline-xl italic uppercase">THE BLUEPRINT</h2>
            <div className="font-label-mono text-label-mono text-secondary uppercase pb-2">Fig 1. Auction Rules</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-r border-on-primary-container">
            {/* STEP 01 */}
            <div className="p-8 border-l border-b md:border-b-0 border-on-primary-container hover:bg-secondary transition-colors duration-300 group">
              <div className="mb-8">
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">groups</span>
              </div>
              <h4 className="font-headline-md text-headline-md mb-4 uppercase flex items-center gap-3">
                <span className="font-headline-sm text-headline-sm text-secondary group-hover:text-white">01</span>
                Create Room
              </h4>
              <p className="font-body-md text-body-md opacity-80">Pick your tournament, set custom budget rules, and invite your fiercest rivals to the table.</p>
            </div>
            {/* STEP 02 */}
            <div className="p-8 border-l border-b md:border-b-0 border-on-primary-container hover:bg-secondary transition-colors duration-300 group">
              <div className="mb-8">
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">timer</span>
              </div>
              <h4 className="font-headline-md text-headline-md mb-4 uppercase flex items-center gap-3">
                <span className="font-headline-sm text-headline-sm text-secondary group-hover:text-white">02</span>
                Live Auction
              </h4>
              <p className="font-body-md text-body-md opacity-80">Bid on superstars under the digital hammer. Every second counts. Beware the anti-sniping clock.</p>
            </div>
            {/* STEP 03 */}
            <div className="p-8 border-l border-b md:border-b-0 border-on-primary-container hover:bg-secondary transition-colors duration-300 group">
              <div className="mb-8">
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              </div>
              <h4 className="font-headline-md text-headline-md mb-4 uppercase flex items-center gap-3">
                <span className="font-headline-sm text-headline-sm text-secondary group-hover:text-white">03</span>
                Build Squad
              </h4>
              <p className="font-body-md text-body-md opacity-80">Set your Captain (2x) and Vice-Captain (1.5x). Manage your roster through transfers and strategic drops.</p>
            </div>
            {/* STEP 04 */}
            <div className="p-8 border-l border-on-primary-container hover:bg-secondary transition-colors duration-300 group">
              <div className="mb-8">
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <h4 className="font-headline-md text-headline-md mb-4 uppercase flex items-center gap-3">
                <span className="font-headline-sm text-headline-sm text-secondary group-hover:text-white">04</span>
                Track & Win
              </h4>
              <p className="font-body-md text-body-md opacity-80">Watch live as your players accumulate points from real-world performance. Dominate the index.</p>
            </div>
          </div>
        </section>

        {/* DATA VISUALIZATION AREA */}
        <section className="grid grid-cols-1 md:grid-cols-12 border-b-2 border-primary">
          <div className="md:col-span-7 p-12 flex flex-col justify-center">
            <h2 className="font-headline-xl text-headline-xl uppercase mb-6 leading-none">TAKE THE PITCH.</h2>
            <p className="font-body-lg text-body-lg mb-8 max-w-lg">No money down. Absolute bragging rights. Bring your professional football knowledge to the auction table and prove your managerial elite status.</p>
            <div className="inline-block">
              <button className="bg-secondary text-on-secondary px-8 py-4 font-label-caps text-headline-sm italic flex items-center gap-4 hover:translate-x-2 transition-transform">
                SUBSCRIBE NOW <span className="material-symbols-outlined">trending_flat</span>
              </button>
            </div>
          </div>
          <div className="md:col-span-5 relative min-h-[400px] border-l-2 border-primary bg-surface-variant overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="w-full h-full bg-cover bg-center grayscale opacity-40" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA5zszJyTQPYnMjBGUHzjMafcXhv-lpS_y1VGTemDbI1eM7R7Jxhyecd7MYCOPlQNkTwEpYppa9dGZCIE2CRO1S6sbuEjnq55f6Y_H61M59l3RUgbn9NaOTuFMGw-wh4y6jdSzUMIk8aI-XohWxI3ohYiSBblkm0j7w8JC7jG0xUEySEXJbX3ybJqZ6xpVTpMDDG4TwbxuyAEPpdzBNuTrwvOODgwJ6uxRLbtGeNFsKw-ScwBxypdgFoWEDsPs6x2WlR2JP3D_ZDpo')" }}></div>
            </div>
            <div className="relative z-10 p-8 flex flex-col h-full justify-between">
              <div className="bg-primary text-on-primary p-4 inline-block font-label-mono text-label-caps self-start">
                // STATUS: SYSTEM READY
              </div>
              <div className="bg-white/90 p-6 border-2 border-primary">
                <div className="font-label-mono text-[10px] text-secondary mb-2">REAL-TIME DATA FEED</div>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-outline-variant pb-1">
                    <span className="font-label-mono text-label-mono">MBAPPÉ</span>
                    <span className="font-label-mono text-label-mono font-bold">$114M</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant pb-1">
                    <span className="font-label-mono text-label-mono">BELLINGHAM</span>
                    <span className="font-label-mono text-label-mono font-bold">$108M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-label-mono text-label-mono">VINÍCIUS JR</span>
                    <span className="font-label-mono text-label-mono font-bold">$102M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-primary border-t-4 border-double border-on-primary">
        <div className="max-w-container-max-width mx-auto flex flex-col md:flex-row justify-between items-center px-section-margin py-8 gap-4">
          <div className="font-label-mono text-label-mono uppercase text-on-primary opacity-80">
            PRINTED IN CYBERSPACE © 2024
          </div>
          <div className="flex gap-8">
            <a className="font-label-mono text-label-mono uppercase text-on-primary opacity-80 hover:text-secondary-fixed-dim transition-colors" href="#">TOS</a>
            <a className="font-label-mono text-label-mono uppercase text-on-primary opacity-80 hover:text-secondary-fixed-dim transition-colors" href="#">EDITORIAL STANDARDS</a>
            <a className="font-label-mono text-label-mono uppercase text-on-primary opacity-80 hover:text-secondary-fixed-dim transition-colors" href="#">API STATUS</a>
          </div>
          <div className="font-label-caps text-label-caps text-secondary">
            MATCHMIND ARCHIVE
          </div>
        </div>
      </footer>

      {/* FAB (Only for main landing context) */}
      <button className="fixed bottom-8 right-8 bg-secondary text-white p-4 rounded-full shadow-2xl active:scale-95 transition-all z-50 flex items-center justify-center border-2 border-white">
        <span className="material-symbols-outlined">chat_bubble</span>
      </button>
    </div>
  );
}
