export default function CreationCard({ creation }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        <img
          src={creation.imageUrl}
          alt={creation.prompt}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-black text-lg mb-2 line-clamp-2">
          {creation.prompt}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>By {creation.creator}</span>
          <span>{creation.date}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {creation.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {creation.license === 'free' ? 'Free' : 'Paid'}
            </span>
            {creation.license === 'paid' && (
              <span className="text-sm font-medium text-green-600">
                {creation.price} ETH
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
