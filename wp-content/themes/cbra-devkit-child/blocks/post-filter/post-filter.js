document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTS
  const block = document.querySelector(".cb-block--post-filter");
  const orderby = block?.dataset.orderby;
  const order = block?.dataset.order;
  const excludeIds = block?.dataset.exclude ? JSON.parse(block.dataset.exclude) : [];

  const filterButtons = document.querySelectorAll(".post-filter__selector");
  const loadmoreButton = document.querySelector(".post-filter__loadmore");
  const searchBar = document.getElementById("search__input");

  const paginationWrapper = document.querySelector(".post-filter__pagination");
  const paginationCurrent = paginationWrapper.querySelector(".current");
  const paginationMax = paginationWrapper.querySelector(".max");
  const paginationPrevious = paginationWrapper.querySelector(".previous");
  const paginationNext = paginationWrapper.querySelector(".next");

  const noResults = document.querySelector(".no-results");

  let currentPage = 1;
  let activeRequest = null;

  // HELPERS

  const getSelectedIds = () => {
    let termList = [];

    const selectedFilterButtons = document.querySelectorAll(
      ".post-filter__selector.active"
    );

    selectedFilterButtons?.forEach((btn) => {
      termList.push(btn.dataset.termId);
    });

    return termList;
  };

  const getSearchTerm = () => {
    return searchBar.value;
  };

  /**
   * Creates a valid HTML node to representing a single found post
   *
   * @param     {object}    post      an object describing one of the found posts
   *
   * @returns                         the HTML node to be inserted into the grid
   */
  const constructCardHTML = (post) => {
    const template = document.getElementById("postfilter__post-template");
    const clone = template.content.cloneNode(true);

    clone.querySelector(".title").textContent = post.title;
    clone.querySelector(".link").href = post.permalink;

    const dateField = clone.querySelector(".date");
    if (post.date) {
      dateField.textContent = post.date;
    } else {
      dateField.remove();
    }

    const thumbnailImg = clone.querySelector(".thumbnail--img");
    const thumbnailVid = clone.querySelector(".thumbnail--vid");

    if (post.thumbnail_video) {
      thumbnailVid.src = post.thumbnail_video;
      thumbnailImg.remove();
    } else if (post.thumbnail_img) {
      thumbnailImg.src = post.thumbnail_img;
      thumbnailVid.remove();
    } else {
      thumbnailImg.remove();
      thumbnailVid.remove();
    }

    const excerptField = clone.querySelector(".excerpt__text");
    if (post.excerpt) {
      excerptField.textContent = post.excerpt;
    } else {
      excerptField.remove();
    }

    return clone;
  };

  const updatePagination = (pagination) => {
    currentPage = pagination.current;

    paginationCurrent.textContent = pagination.current;
    paginationMax.textContent = pagination.max;

    if (pagination.current <= 1) {
      paginationPrevious.classList.add("inactive");
      paginationPrevious.disabled = true;
    } else {
      paginationPrevious.classList.remove("inactive");
      paginationPrevious.disabled = false;
    }

    if (pagination.current >= pagination.max) {
      paginationNext.classList.add("inactive");
      paginationNext.disabled = true;
    } else {
      paginationNext.classList.remove("inactive");
      paginationNext.disabled = false;
    }

    paginationWrapper.style.display = "flex";
  };

  const filter = (page = 1) => {
    const selectedTermIds = getSelectedIds();

    const searchTerm = getSearchTerm();

    const params = new URLSearchParams();
    selectedTermIds.forEach((id) => {
      params.append("term_ids[]", id);
    });

    if (searchTerm) {
      params.append("search_term", searchTerm);
    }

    if (page) {
      params.append("page", page);
    }

    if (orderby) {
      params.append("orderby", orderby);
    }

    if (order) {
      params.append("order", order);
    }

    excludeIds.forEach((id) => {
      params.append("exclude_ids[]", id);
    });

    const queryString = params.toString();

    const url = queryString
      ? `/wp-json/postfilter/posts?${queryString}`
      : `/wp-json/postfilter/posts`;

    if (activeRequest) {
      activeRequest.abort();
    }

    const controller = new AbortController();
    activeRequest = controller;

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal
    })
      .then((res) => {
        if (res.status === 204) {
          paginationWrapper.style.display = "none";
          noResults.style.display = "block";

          return;
        }

        return res.json();
      })
      .then((json) => {
        const grid = document.getElementById("post-filter__grid");
        grid.innerHTML = "";

        if (!json || !json.posts || json.posts.length === 0) {
          return;
        }

        noResults.style.display = "none";

        json.posts.forEach((post) => {
          const html = constructCardHTML(post);
          grid.appendChild(html);
        });

        updatePagination(json.pagination);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          throw err;
        }
      });
  };

  // EVENTS
  /* click on the filter buttons */
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const wasActive = btn.classList.contains("active");

      filterButtons.forEach((otherBtn) => {
        otherBtn.classList.remove("active");
      });

      if (!wasActive) {
        btn.classList.add("active");
      }

      filter();
    });
  });

  document.querySelector(".search").addEventListener("click", () => {
    filter();
  });

  searchBar.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      filter();
    }
  });

  /* load next page*/
  paginationNext.addEventListener("click", () => {
    filter(currentPage + 1);
  });

  /* load previous page */
  paginationPrevious.addEventListener("click", () => {
    filter(currentPage - 1);
  });

  /* page load */
  filter();
});
