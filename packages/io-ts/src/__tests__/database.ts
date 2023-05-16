interface Car {
  make: string;
  model: string;
}

interface Kingdom {
  name: string;
}

interface Phylum {
  kingdom: string;
  name: string;
}

interface Class {
  phylum: string;
  name: string;
}

interface Author {
  id: string;
  name: string;
}

interface Post {
  id: string;
  author_id: string;
  title: string;
}

interface Comment {
  id: string;
  post_id: string;
  username: string;
}

export interface Database {
  car: Car;
  kingdom: Kingdom;
  phylum: Phylum;
  class: Class;
  author: Author;
  post: Post;
  comment: Comment;
}
