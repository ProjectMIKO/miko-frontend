// @type {import('next').NextConfig}
const nextConfig = {
    env: {
      NEXT_OPENVIDU_URL: process.env.NEXT_OPENVIDU_URL, // 환경 변수를 설정합니다.
    },
  };
  
  export default nextConfig;
  