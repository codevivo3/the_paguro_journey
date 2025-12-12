export default function Hero() {
  return (
    <div className='absolute inset-0 z-20 flex items-center justify-center items-end pb-36'>
      <div className='text-center text-white px-6 w-full'>
        <h1 className='text-[clamp(3rem,4vw,7rem)] text-shadow-lg/100 font-bold'>
          The Paguro Journey
        </h1>

        <p className='mt-4 text-[clamp(0.9rem,1.8vw,1.5rem)] tracking-wide opacity-80 text-shadow-lg/70 font-bold'>
          Text 1 • Text 2 • Text 3
        </p>
      </div>
    </div>
  );
}
