module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite/**/*.js",
    "./public/index.html",
    "./public/styles/global.css",  // 여기에 추가합니다.
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
