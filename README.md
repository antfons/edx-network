

# Edx Books Search 

![Backend lang](https://img.shields.io/badge/python-3.6-green)



[Brief video on Youtube](https://www.youtube.com/watch?v=9-DY5qaY6Ck&t=25s "video")

#### Description
This project aims to create a social media like website where user are able to make new posts and navigate through posts all users, give likes on posts and also follow other users.


## Table of content

- [**Getting Started**](#getting-started)
- [Built With](#built-with)
- [License](#license)
- [Motivation](#motivation)

## Getting Started
You can run this application by cloning the repository and running it with python.

### Requirements
- Python
- pipenv
- set your engine database/credentials on network/settings.py

### Example for a simple local sqlite
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
```

### Install python dependencies
```console
pipenv shell
```

### Migrate models to database
```console
python manage.py makemigrations network
python manage.py migrate
```

### Running the django application

```console
python manage.py
```
### Open the application on the browser, create your user and start using it.

### Features
- Mkae new Posts
- See all Posts made by all users
- See Profile page of an specific user
- Able to follow/unfollow other users
- See All Posts only for user's following list
- Posts are displayed with pagination
- Users can edit their posts
- Like/unlike a post

### Open the application on the browser, create your user and start using it.
http://localhost:8000/

## Built With

### [Django](https://www.djangoproject.com/ "Django")
A high-level Python Web framework.
### Python
### JavaScript
### HTML
### CSS
### [Bootstrap](https://getbootstrap.com/ "Bootstrap")

## License

This project is licensed under the [MIT License](https://github.com/antfons/edx-network/blob/main/LICENSE)


## Motivation
I've made this project while learning web development with Python and JavaScript and it's part of EDX HarvardX CS50's Web Programming with Python and JavaScript. [Edx Web Programming](https://courses.edx.org/courses/course-v1:HarvardX+CS50W+Web/course/ "Edx Web Programming")
