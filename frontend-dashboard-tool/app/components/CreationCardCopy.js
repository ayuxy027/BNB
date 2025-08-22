export default function CreationCard({ creation }) {
  return (
    <div className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-300/70 hover:transform hover:scale-[1.02]">
      {/* Image Container */}
      <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        <img
          src={creation.imageUrl}
          alt={creation.prompt}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        />
        
        {/* Top left action buttons */}
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
          <div className="flex flex-col gap-3">
            {/* Like Button */}
            <button className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg border border-gray-200/50 hover:border-gray-300/70 hover:scale-110 group/btn">
              <svg className="w-6 h-6 text-gray-700 group-hover/btn:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            
            {/* Share Button */}
            <button className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg border border-gray-200/50 hover:border-gray-300/70 hover:scale-110 group/btn">
              <svg className="w-6 h-6 text-gray-700 group-hover/btn:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Top right - License indicator */}
        <div className="absolute top-4 right-4">
          {creation.license === 'paid' && (
            <div className="bg-gray-800/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg border border-gray-700/50">
              Premium
            </div>
          )}
        </div>
        
        {/* Hover overlay with details */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <div className="text-white space-y-4">
            {/* Creator and Date Row */}
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-sm text-gray-200 font-medium mb-1">
                  {creation.creator}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">
                  {new Date(creation.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            
            {/* Tags and Price Row */}
            <div className="flex items-end justify-between">
              {/* Tags */}
              <div className="flex-1 mr-4">
                <div className="flex flex-wrap gap-2">
                  {creation.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm font-medium border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Price */}
              <div className="text-right">
                {creation.license === 'paid' && (
                  <div className="text-lg font-semibold text-green-400">
                    Îž {creation.price}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}