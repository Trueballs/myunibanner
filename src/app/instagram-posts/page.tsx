'use client';

import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

export default function InstagramPostsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadPost = async (postId: string) => {
    setDownloading(postId);
    try {
      const element = document.getElementById(postId);
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `instagram-post-${postId}.png`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#111827] mb-2">Instagram Posts</h1>
        <p className="text-gray-600 mb-8">6 professional posts ready to download and share</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* POST 1: STEP 1 */}
          <div id="post-1" className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ aspectRatio: '1080/1350', maxWidth: '360px', margin: '0 auto', width: '100%' }}>
            <div className="w-full h-full flex flex-col p-8 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
                <span className="bg-[#0A66C2] text-white text-xs font-bold px-3 py-1 rounded-full">Step 1 of 3</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-black text-[#111827] mb-1 leading-tight">Create Your Perfect Banner</h2>
              <p className="text-gray-600 text-sm mb-6 font-medium">Professional banners in seconds</p>

              {/* Visual Element */}
              <div className="flex-1 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6 flex items-center justify-center shadow-lg overflow-hidden">
                <div className="text-center text-white">
                  <p className="text-5xl mb-2">✨</p>
                  <p className="text-xl font-bold">Generate</p>
                  <p className="text-sm opacity-90">With AI</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-3 font-medium">
                Choose your university, select a layout, and let our AI generate a stunning banner for your profile. No design skills needed.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-auto">
                <span className="font-bold text-[#0A66C2]">🎯 Fast:</span>
                <span>Takes less than 30 seconds</span>
              </div>

              {/* CTA */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                <button onClick={() => downloadPost('post-1')} disabled={downloading === 'post-1'} className="w-full bg-[#0A66C2] text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-sm">
                  {downloading === 'post-1' ? 'Downloading...' : '↓ Download'}
                </button>
              </div>

              {/* Footer */}
              <div className="text-center pt-3">
                <p className="text-gray-500 text-xs">
                  <span className="font-bold">@linkinidee</span> • linkinidee.com
                </p>
              </div>
            </div>
          </div>

          {/* POST 2: STEP 2 */}
          <div id="post-2" className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ aspectRatio: '1080/1350', maxWidth: '360px', margin: '0 auto', width: '100%' }}>
            <div className="w-full h-full flex flex-col p-8 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
                <span className="bg-[#0A66C2] text-white text-xs font-bold px-3 py-1 rounded-full">Step 2 of 3</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-black text-[#111827] mb-1 leading-tight">Customize Everything</h2>
              <p className="text-gray-600 text-sm mb-6 font-medium">Make it uniquely yours</p>

              {/* Visual Element */}
              <div className="flex-1 bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 rounded-2xl mb-6 flex items-center justify-center shadow-lg overflow-hidden">
                <div className="text-center text-white">
                  <p className="text-5xl mb-2">🎨</p>
                  <p className="text-xl font-bold">Customize</p>
                  <p className="text-sm opacity-90">Colors & Text</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-3 font-medium">
                Edit layouts, swap photos, change colors, and personalize your headline. Preview changes instantly before downloading.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-auto">
                <span className="font-bold text-[#0A66C2]">⚡ Real-time:</span>
                <span>See updates instantly</span>
              </div>

              {/* CTA */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                <button onClick={() => downloadPost('post-2')} disabled={downloading === 'post-2'} className="w-full bg-[#0A66C2] text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-sm">
                  {downloading === 'post-2' ? 'Downloading...' : '↓ Download'}
                </button>
              </div>

              {/* Footer */}
              <div className="text-center pt-3">
                <p className="text-gray-500 text-xs">
                  <span className="font-bold">@linkinidee</span> • linkinidee.com
                </p>
              </div>
            </div>
          </div>

          {/* POST 3: STEP 3 */}
          <div id="post-3" className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ aspectRatio: '1080/1350', maxWidth: '360px', margin: '0 auto', width: '100%' }}>
            <div className="w-full h-full flex flex-col p-8 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
                <span className="bg-[#0A66C2] text-white text-xs font-bold px-3 py-1 rounded-full">Step 3 of 3</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-black text-[#111827] mb-1 leading-tight">Download & Share</h2>
              <p className="text-gray-600 text-sm mb-6 font-medium">Go viral on LinkedIn</p>

              {/* Visual Element */}
              <div className="flex-1 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl mb-6 flex items-center justify-center shadow-lg overflow-hidden">
                <div className="text-center text-white">
                  <p className="text-5xl mb-2">🚀</p>
                  <p className="text-xl font-bold">Share</p>
                  <p className="text-sm opacity-90">Post & Engage</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-3 font-medium">
                Download your banner as PNG, post on LinkedIn, and watch the engagement roll in. Our banners drive 3x more clicks.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-auto">
                <span className="font-bold text-[#0A66C2]">📊 Proven:</span>
                <span>Used by 10k+ professionals</span>
              </div>

              {/* CTA */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                <button onClick={() => downloadPost('post-3')} disabled={downloading === 'post-3'} className="w-full bg-[#0A66C2] text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-sm">
                  {downloading === 'post-3' ? 'Downloading...' : '↓ Download'}
                </button>
              </div>

              {/* Footer */}
              <div className="text-center pt-3">
                <p className="text-gray-500 text-xs">
                  <span className="font-bold">@linkinidee</span> • linkinidee.com
                </p>
              </div>
            </div>
          </div>

          {/* POST 4: BENEFIT 1 */}
          <div id="post-4" className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ aspectRatio: '1080/1350', maxWidth: '360px', margin: '0 auto', width: '100%' }}>
            <div className="w-full h-full flex flex-col p-8 bg-gradient-to-br from-white via-blue-50 to-white relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-black text-[#111827] mb-6 leading-tight">
                Stand Out on <span className="text-[#0A66C2]">LinkedIn</span>
              </h2>

              {/* Stat Box */}
              <div className="flex-1 bg-gradient-to-br from-[#0A66C2] to-blue-700 rounded-2xl mb-6 flex flex-col items-center justify-center shadow-lg text-white p-6">
                <p className="text-5xl font-black mb-2">3x</p>
                <p className="text-center font-bold text-lg">More Engagement</p>
                <p className="text-center text-blue-100 text-sm mt-2">Banners that get noticed</p>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-auto">
                <div className="flex gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-bold text-[#111827] text-sm">Professional Design</p>
                    <p className="text-gray-600 text-xs">Instantly elevate your profile</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-bold text-[#111827] text-sm">AI-Powered</p>
                    <p className="text-gray-600 text-xs">Smart recommendations included</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-bold text-[#111827] text-sm">Free & Fast</p>
                    <p className="text-gray-600 text-xs">No credit card required</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4 border-t border-gray-200">
                <button onClick={() => downloadPost('post-4')} disabled={downloading === 'post-4'} className="w-full bg-[#0A66C2] text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-sm">
                  {downloading === 'post-4' ? 'Downloading...' : '↓ Download'}
                </button>
              </div>

              {/* Footer */}
              <div className="text-center pt-3">
                <p className="text-gray-500 text-xs">
                  <span className="font-bold">@linkinidee</span> • linkinidee.com
                </p>
              </div>
            </div>
          </div>

          {/* POST 5: CTA */}
          <div id="post-5" className="bg-gradient-to-br from-gray-900 via-[#0A66C2] to-gray-900 rounded-lg shadow-lg overflow-hidden" style={{ aspectRatio: '1080/1350', maxWidth: '360px', margin: '0 auto', width: '100%' }}>
            <div className="w-full h-full flex flex-col justify-between p-8 text-white relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center font-bold text-lg">L</div>
              </div>

              {/* Main Message */}
              <div className="text-center">
                <h2 className="text-4xl font-black mb-4 leading-tight">
                  Stop Blending In.
                </h2>
                <h3 className="text-3xl font-black text-blue-300 mb-4">Start Standing Out.</h3>
                <p className="text-blue-100 text-lg">
                  Get your professional banner in 30 seconds.
                </p>
              </div>

              {/* Social Proof */}
              <div className="bg-white bg-opacity-10 rounded-lg p-4 border border-white border-opacity-20 text-center backdrop-blur">
                <p className="text-white text-sm font-bold mb-2">Join 10,000+ professionals</p>
                <p className="text-blue-100 text-xs">who've boosted their LinkedIn presence</p>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <button onClick={() => downloadPost('post-5')} disabled={downloading === 'post-5'} className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-black py-4 rounded-lg transition-all disabled:opacity-50">
                  {downloading === 'post-5' ? 'Downloading...' : 'Try It Free →'}
                </button>
                <p className="text-center text-blue-100 text-xs">
                  No credit card • Takes 30 seconds
                </p>
              </div>

              {/* Footer */}
              <div className="border-t border-white border-opacity-20 pt-4 text-center">
                <p className="text-blue-100 text-xs">
                  <span className="font-bold">@linkinidee</span> • linkinidee.com
                </p>
              </div>
            </div>
          </div>

          {/* POST 6: SOCIAL PROOF */}
          <div id="post-6" className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ aspectRatio: '1080/1350', maxWidth: '360px', margin: '0 auto', width: '100%' }}>
            <div className="w-full h-full flex flex-col justify-between p-8 bg-white relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
                <span className="text-2xl">⭐⭐⭐⭐⭐</span>
              </div>

              {/* Testimonial */}
              <div className="text-center mb-auto">
                <h2 className="text-2xl font-black text-[#111827] mb-6">
                  What Our Users Say
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-[#0A66C2]">
                    <p className="text-[#111827] font-bold text-sm mb-2">
                      "Increased my LinkedIn engagement by 250% in just one month!"
                    </p>
                    <p className="text-gray-600 text-xs font-semibold">— Marcus S., CEO</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-gray-300">
                    <p className="text-[#111827] font-bold text-sm mb-2">
                      "The fastest way to create professional banners."
                    </p>
                    <p className="text-gray-600 text-xs font-semibold">— Sarah M., Recruiter</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <button onClick={() => downloadPost('post-6')} disabled={downloading === 'post-6'} className="w-full bg-[#0A66C2] text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50">
                  {downloading === 'post-6' ? 'Downloading...' : '↓ Get Started Free'}
                </button>
              </div>

              {/* Footer */}
              <div className="text-center pt-3">
                <p className="text-gray-500 text-xs">
                  <span className="font-bold">@linkinidee</span> • linkinidee.com
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <div className="bg-blue-50 border-l-4 border-[#0A66C2] p-6 rounded-lg">
            <h3 className="font-bold text-[#111827] mb-3">📥 How to Download</h3>
            <ol className="text-gray-700 space-y-2 text-sm">
              <li>✅ Click "Download" button on any post</li>
              <li>✅ Image saves automatically</li>
              <li>✅ Upload to Instagram Stories or Feed</li>
              <li>✅ Watch engagement grow! 📈</li>
            </ol>
          </div>

          <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
            <h3 className="font-bold text-[#111827] mb-3">💡 Pro Tips</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>✨ Post 3x per week for best results</li>
              <li>🎯 Mix up the post types</li>
              <li>📱 Use Carousel format on Instagram</li>
              <li>⏰ Post during peak hours (9-11am)</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
