
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("add_post", views.add_post, name="add_post"),
    path("edit_post", views.edit_post, name="edit_post"),
    path("all_posts", views.get_all_posts, name="all_posts"),
    path("user/<int:user_id>", views.get_user, name="user"),
    path("user_posts/<int:user_id>", views.get_user_posts, name="user_posts"),
    path("follow", views.follow, name="follow"),
    path("following_post", views.following_posts, name="following_posts"),
    path("like_post", views.like_post, name="like_post"),
    path("get_post_page", views.get_post_page, name="get_post_page"),
    path("get_following_post_page", views.get_following_post_page, name="get_following_post_page"),
    path("get_user_post_page", views.get_user_post_page, name="get_user_post_page")
]
