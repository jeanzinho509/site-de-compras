document.addEventListener("DOMContentLoaded", () => {
  // Add click event to category boxes
  const categories = document.querySelectorAll(".category");
  categories.forEach(category => {
      category.addEventListener("click", () => {
          alert(`You selected the ${category.textContent} category!`);
      });
  });

  // Add click event to the hero button
  const heroButton = document.querySelector(".hero button");
  heroButton.addEventListener("click", () => {
      alert("Redirecting you to the shop now page...");
  });

  // Search bar functionality
  const searchBar = document.querySelector(".search-bar button");
  searchBar.addEventListener("click", () => {
      const query = document.querySelector(".search-bar input").value;
      if (query.trim()) {
          alert(`Searching for: ${query}`);
      } else {
          alert("Please enter a search term.");
      }
  });
});
