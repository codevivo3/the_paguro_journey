// This component renders the homepage hero text overlay
export default function Hero() {
  // Positions content over the hero video
  return (
    <div className='absolute inset-0 z-20 flex justify-center items-end pb-36'>
      {/* Centers and constrains the hero text */}
      <div className='text-center text-white px-6 w-full'>
        {/* Main homepage heading (brand/title) */}
        <h1 className='text-[clamp(3rem,4vw,7rem)] text-shadow-lg/100 font-bold'>
          The Paguro Journey
        </h1>

        {/* Supporting tagline/subtitle */}
        <p className='mt-4 text-[clamp(0.9rem,1.8vw,1.5rem)] tracking-wide opacity-80 text-shadow-lg/70 font-bold'>
          Text 1 • Text 2 • Text 3
        </p>
      </div>
    </div>
  );
}
