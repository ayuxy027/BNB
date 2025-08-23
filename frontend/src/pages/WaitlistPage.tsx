import WaitlistHero from '../components/WaitlistHero'
import WaitlistGallery from '../components/WaitlistGallery'
import WaitlistFooter from '../components/WaitlistFooter'

const WaitlistPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <WaitlistHero />
      <WaitlistGallery />
      <WaitlistFooter />
    </div>
  )
}

export default WaitlistPage
