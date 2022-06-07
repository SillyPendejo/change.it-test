class Blog {
  constructor(blogElement) {
    this.blog = blogElement;
    this.blogTitle = document.querySelector(".blog__input_header");
    this.blogText = document.querySelector(".blog__input_text");
    this.postButton = document.querySelector(".story__button");
    this.sortButtons = document.querySelector(".blog__button_container");
    this.searchBar = document.querySelector(".blog__searchbar");
    this.foundFilteredSorted = false;
    this.foundFiltered = false;
    this.sortBy = false;
    this.abc = false;
    this.date = false;
    this.reverseSort = false;

    this.renderPosts(this.sortPosts(this.filterPosts()));

    this.blogTitle.addEventListener("focus", () => this.clearTitleError());
    this.blog.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!this.blogTitle.value) {
        this.createTitleError();
        return;
      }
      this.addPost();
      let sorted = this.sortPosts(this.filterPosts());
      this.renderPosts(sorted);
    });

    this.sortButtons.addEventListener("click", (event) => {
      if (event.target.tagName == "BUTTON") {
        this.changeButtonsState(event.target);
        let sorted = this.sortPosts(this.filterPosts());
        this.renderPosts(sorted);
      }
    });

    this.searchBar.addEventListener("input", () => {
      let sorted = this.sortPosts(this.filterPosts());
      this.renderPosts(sorted);
    });
  }

  get storage() {
    let blogStorage = localStorage.blog ?
    JSON.parse(localStorage.blog)
    : [
        {
          isSorted: false,
          abc: false,
          date: false,
          isReversed: false,
          filter: "",
          posts: [],
        },
      ];
    return blogStorage;
  }

  set storage(entries) {
    localStorage.blog = JSON.stringify(entries);
  }

  addPost() {
    let blogTitle = this.blogTitle.value;
    let blogText = this.blogText.value;

    let post = {
      title: blogTitle,
      text: blogText,
      date: Date.now(),
    };

    let storage = this.storage;
    for (let entry of storage) {
      if (blogTitle.toUpperCase().includes(entry.filter.toUpperCase())) {
        this.insertPostInStorage(post, entry);
      }
    }
    this.storage = storage;
  }

  insertPostInStorage(post, entry) {
    if (!entry.isSorted) {
      entry.posts.push(post);
    } else {
      let index = entry.posts.findIndex(function (entryPost) {
        let postValue, entryPostValue;
        let result;
        if (entry.abc) {
          postValue = post.title;
          entryPostValue = entryPost.title;
        } else if (entry.date) {
          postValue = post.date;
          entryPostValue = entryPost.date;
        }
        result = postValue < entryPostValue;
        if (entry.isReversed) result = postValue > entryPostValue;
        return result;
      });

      if (index == -1) {
        if (entry.isReversed) {
          entry.posts.unshift(post);
        } else {
          entry.posts.push(post);
        }
      } else {
        entry.posts.splice(index, 0, post);
      }
    }
  }

  createPost(post) {
    let template = document.querySelector(".post__template");
    let postElement = template.content.firstElementChild.cloneNode(true);

    postElement.setAttribute("post_id", post.date);
    postElement.querySelector(".blog__post_title").textContent = post.title;
    postElement.querySelector(".blog__post_text").textContent = post.text;
    postElement.querySelector(".blog__post_date").textContent = new Date(
      post.date
    ).toLocaleString();
    postElement
      .querySelector(".blog__post_delete")
      .addEventListener("click", () => {
        this.deletePost(postElement);
      });
    return postElement;
  }

  deletePost(post) {
    let postId = +post.getAttribute("post_id");
    let storage = this.storage;

    post.remove();
    for (let entry of storage) {
      for (let i = 0; i < entry.posts.length; i++) {
        if (entry.posts[i].date == postId) {
          entry.posts.splice(i, 1);
          break;
        }
      }
    }
    this.storage = storage;
  }

  createTitleError() {
    this.blogTitle.classList.add("blog__input_error");
    this.blogTitle.setAttribute("placeholder", "Empty title");
  }

  clearTitleError() {
    this.blogTitle.classList.remove("blog__input_error");
    this.blogTitle.setAttribute("placeholder", "Name your story...");
  }

  clearAllPosts() {
    let postsContainer = document.querySelector(".blog__posts");
    for (let post of [...postsContainer.children]) {
      post.remove();
    }
  }

  addStorageEntry(posts) {
    if (this.searchBar.value && posts.length == 0) return;
  
    let entry = {
      isSorted: this.sortBy,
      abc: this.abc,
      date: this.date,
      isReversed: this.reverseSort,
      filter: this.searchBar.value,
      posts: posts,
    };
    let storage = this.storage;
    storage.push(entry);
    this.storage = storage;
  }

  renderPosts(posts) {
    if (this.foundFilteredSorted) {
      this.foundFilteredSorted = false;
    } else {
      this.addStorageEntry(posts);
    }

    this.clearAllPosts();
    for (let post of posts) {
      document.querySelector(".blog__posts").append(this.createPost(post));
    }
  }

  findInStorage(searchValue) {
    let storage = this.storage;
    let posts = null;

    for (let entry of storage) {
      if (
        entry.filter.toUpperCase() == searchValue.toUpperCase() &&
        entry.isSorted == this.sortBy &&
        entry.abc == this.abc &&
        entry.isReversed == this.reverseSort
      ) {
        posts = entry.posts;
        this.foundFilteredSorted = true;
      }
    }

    if (!posts) {
      for (let entry of storage) {
        if (entry.filter.toUpperCase() == searchValue.toUpperCase()) {
          posts = entry.posts;
          this.foundFiltered = true;
        }
      }
    }

    return posts;
  }

  filterPosts() {
    let searchValue = this.searchBar.value;
    let filteredPosts = this.findInStorage(searchValue);

    if (!filteredPosts) {
      filteredPosts = this.storage[0].posts;
    } else if (this.foundFilteredSorted || this.foundFiltered) {

      return filteredPosts;

    }

    if (!searchValue) {
      return filteredPosts;
    }

    filteredPosts = filteredPosts.filter((post) => {
      let title = post.title.toUpperCase();
      let search = searchValue.toUpperCase();
      return title.includes(search);
    });
    return filteredPosts;
  }

  sortPosts(filteredPosts) {
    if (this.foundFilteredSorted) {
      return filteredPosts;
    } else if (this.foundFiltered) {
      this.foundFiltered = false;
    }

    if (!this.sortBy) return filteredPosts;
    if (filteredPosts.length < 2) return filteredPosts;

    function _comparePosts(first, second) {
      let firstValue, secondValue;
      let result;

      if (this.abc) {
        firstValue = first.title;
        secondValue = second.title;
      } else if (this.date) {
        firstValue = first.date;
        secondValue = second.date;
      }

      result = firstValue > secondValue ? 1 : -1;
      if (this.reverseSort) return result == 1 ? -1 : 1;
      return result;
    }
    let comparePosts = _comparePosts.bind(this);

    return filteredPosts.sort(comparePosts);
  }

  buttonIsOn(buttonElement) {
    return buttonElement.classList.contains("blog__sort_button_on");
  }

  changeButtonsState(button) {
    let sortbyElement = document.querySelector(".blog__sort_sortby");
    let abcElement = document.querySelector(".blog__sort_abc");
    let dateElement = document.querySelector(".blog__sort_date");

    function _switchButtonTo(boolValue, buttonElement, buttonName) {
      if (boolValue) {
        this[buttonName] = true;
        buttonElement.classList.add("blog__sort_button_on");
      } else {
        this[buttonName] = false;
        buttonElement.classList.remove("blog__sort_button_on");
      }
    }
    let switchButtonTo = _switchButtonTo.bind(this);

    function _toggleSortFor(buttonElement) {
      if (this.reverseSort) {
        buttonElement.style.backgroundImage = "";
      } else {
        buttonElement.style.backgroundImage = "url('../img/reversesort.png')";
      }
      this.reverseSort = !this.reverseSort;
    }
    let toggleSortFor = _toggleSortFor.bind(this);

    if (button.classList.contains("blog__sort_sortby")) {
      if (this.buttonIsOn(button)) {
        switchButtonTo(false, sortbyElement, "sortBy");
        switchButtonTo(false, abcElement, "abc");
        switchButtonTo(false, dateElement, "date");
        this.reverseSort = false;
        abcElement.style.backgroundImage = "";
        dateElement.style.backgroundImage = "";
      }
    }
    if (button.classList.contains("blog__sort_abc")) {
      if (this.buttonIsOn(button)) {
        toggleSortFor(abcElement);
      } else {
        switchButtonTo(true, sortbyElement, "sortBy");
        switchButtonTo(true, abcElement, "abc");
        switchButtonTo(false, dateElement, "date");
        this.reverseSort = false;
        dateElement.style.backgroundImage = "";
      }
    }
    if (button.classList.contains("blog__sort_date")) {
      if (this.buttonIsOn(button)) {
        toggleSortFor(dateElement);
      } else {
        switchButtonTo(true, sortbyElement, "sortBy");
        switchButtonTo(false, abcElement, "abc");
        switchButtonTo(true, dateElement, "date");
        this.reverseSort = false;
        abcElement.style.backgroundImage = "";
      }
    }
  }
}

const blog = new Blog(document.querySelector(".blog"));
