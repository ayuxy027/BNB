import WaitlistHero from '../components/WaitlistHero'
import WaitlistGallery from '../components/WaitlistGallery'
import WaitlistBadge from '../components/WaitlistBadge'
import WaitlistFooter from '../components/WaitlistFooter'

const WaitlistPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <WaitlistHero />
      <WaitlistGallery />
      <WaitlistBadge />
      <WaitlistFooter />
    </div>
  )
}

export default WaitlistPage
