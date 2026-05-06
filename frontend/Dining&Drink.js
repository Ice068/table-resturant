// ==========================
// DATA (แก้ตรงนี้ที่เดียวพอ)
// ==========================
const MENU_DATA = {
  dining: {
    title: "Dining",
    items: [
      { name: "Fish & Chips", price: 150 },
      { name: "Grilled Salmon", price: 225 },
      { name: "Tom Yum", price: 100 },
      { name: "Truffle Steak", price: 290 }
    ],
    image: "https://images.unsplash.com/photo-1544025162-d76694265947"
  },
  bar: {
    title: "The Bar",
    items: [
      { name: "Classic Martini", price: 120 },
      { name: "Whiskey Sour", price: 140 },
      { name: "Mojito", price: 130 },
      { name: "Signature Cocktail", price: 160 }
    ],
    image: "https://images.unsplash.com/photo-1514361892635-eae31d4a7b52"
  }
};

// ==========================
// ELEMENTS
// ==========================
const titleEl = document.getElementById("menuTitle");
const contentEl = document.getElementById("menuContent");
const imageEl = document.getElementById("menuImage");
const buttons = document.querySelectorAll(".btn-section button");

// ==========================
// RENDER FUNCTION
// ==========================
function renderMenu(type){

  const data = MENU_DATA[type];

  // title
  titleEl.innerText = data.title;

  // content
  contentEl.innerHTML = data.items.map(item => `
    <div class="menu-item">
      <span>${item.name}</span>
      <span>${item.price} บาท</span>
    </div>
  `).join("");

  // image
  if(imageEl){
    imageEl.src = data.image;
  }

  // active button
  buttons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.type === type);
  });

}

// ==========================
// EVENTS
// ==========================
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    renderMenu(type);
  });
});

// ==========================
// INIT
// ==========================
renderMenu("dining");

// ==========================
// NAVBAR SCROLL
// ==========================
window.addEventListener("scroll", () => {
  const nav = document.querySelector(".custom-navbar");
  if(!nav) return;

  nav.classList.toggle("nav-scrolled", window.scrollY > 50);
});
