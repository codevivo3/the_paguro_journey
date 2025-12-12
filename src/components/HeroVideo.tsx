export default function HeroVideo() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      className='w-full h-screen object-cover overflow-hidden'
    >
      <source src='/hero_video_sample.mp4' type='video/mp4' />
    </video>
  );
}
