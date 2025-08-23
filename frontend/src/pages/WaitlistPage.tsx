import WaitlistHero from '../components/WaitlistHero'
import WaitlistGallery from '../components/WaitlistGallery'
import WaitlistFooter from '../components/WaitlistFooter'

const WaitlistPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <WaitlistHero />
      <div className="mt-30 mb-10">
        <WaitlistGallery />
      </div>
      <WaitlistFooter />
    </div>
  )
}

export default WaitlistPage
