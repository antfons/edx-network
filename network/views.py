from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
import json
from .models import User, Post
from django.views.decorators.csrf import csrf_exempt
import django.core.serializers
from django.core.paginator import Paginator


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
def add_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    post = json.loads(request.body)
    

    user = User.objects.get(pk=request.user.id)
    post = Post(
        post_owner=user,
        text=post["message"]
    )
    post.save()
    return JsonResponse({"message": "Post created successfully."}, status=201)

@csrf_exempt
def edit_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    post_json = json.loads(request.body)
    post_id = post_json["post_id"]
    post_text = post_json["message"]
    post = Post.objects.get(pk=post_id)
    post.text = post_text
    post.save()
    return JsonResponse({"message": "Post edited successfully"}, status=200)


def get_all_posts(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)
    all_posts = Post.objects.order_by("-creation_date").all()
    paginator = Paginator(all_posts, 10)
    posts = {}
    if paginator.num_pages > 0:
        posts = paginator.page(1)
    return JsonResponse({"total_pages": paginator.num_pages, "requested_page": 1, "posts": [post.serialize() for post in posts.object_list]}, status=200, safe=False)

@csrf_exempt
def get_post_page(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    post_json = json.loads(request.body)
    page_num = post_json["page_num"]
    
    all_posts = Post.objects.order_by("-creation_date").all()
    paginator = Paginator(all_posts, 10)
    posts = paginator.page(page_num)
    return JsonResponse({"total_pages": paginator.num_pages, "requested_page": page_num, "posts": [post.serialize() for post in posts.object_list]}, status=200, safe=False)


def following_posts(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)
    user = User.objects.get(pk=request.user.id)
    following_users = [user for user in user.following.all()]
    following_posts = Post.objects.filter(post_owner__in=following_users).order_by("-creation_date")
    paginator = Paginator(following_posts, 10)
    posts = {}
    if paginator.num_pages > 0:
        posts = paginator.page(1)
    return JsonResponse({"total_pages": paginator.num_pages, "requested_page": 1, "posts": [post.serialize() for post in posts.object_list]}, status=200, safe=False)

@csrf_exempt
def get_following_post_page(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    user = User.objects.get(pk=request.user.id)
    post_json = json.loads(request.body)
    page_num = post_json["page_num"]
    following_users = [user for user in user.following.all()]
    following_posts = Post.objects.filter(post_owner__in=following_users).order_by("-creation_date")
    paginator = Paginator(following_posts, 10)
    posts = paginator.page(page_num)
    return JsonResponse({"total_pages": paginator.num_pages, "requested_page": page_num, "posts": [post.serialize() for post in posts.object_list]}, status=200, safe=False)

def get_user_posts(request, user_id):
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)
    user = User.objects.get(pk=user_id)
    all_posts = Post.objects.filter(post_owner=user).order_by("-creation_date")
    paginator = Paginator(all_posts, 10)
    posts = {}
    if paginator.num_pages > 0:
        posts = paginator.page(1)
    return JsonResponse({"total_pages": paginator.num_pages, "requested_page": 1, "posts": [post.serialize() for post in posts.object_list]}, status=200, safe=False)

@csrf_exempt
def get_user_post_page(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required."}, status=400)
    post_json = json.loads(request.body)
    page_num = post_json["page_num"]
    user_id = post_json["user_id"]
    user = User.objects.get(pk=user_id)

    all_posts = Post.objects.filter(post_owner=user).order_by("-creation_date")
    paginator = Paginator(all_posts, 10)
    posts = paginator.page(page_num)
    return JsonResponse({"total_pages": paginator.num_pages, "requested_page": page_num, "posts": [post.serialize() for post in posts.object_list]}, status=200, safe=False)
    
    

def get_user(request, user_id):
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)
    user = User.objects.get(pk=user_id)
    return JsonResponse(user.serialize(), status=200, safe=False)


@csrf_exempt
def follow(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
        
    post = json.loads(request.body)
    follower = User.objects.get(pk=request.user.id)
    followed = User.objects.get(pk=post["followed_id"])

    if follower in followed.followers.all():
        followed.followers.remove(follower)
    else:
        followed.followers.add(follower)
    return JsonResponse({"ok": "ok."}, status=200)

@csrf_exempt
def like_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    user = User.objects.get(pk=request.user.id)
    post_json = json.loads(request.body)
    post = Post.objects.get(pk=post_json["post_id"])
    if user in post.likes.all():
        post.likes.remove(user)
    else:
        post.likes.add(user)
    return JsonResponse({"ok": "like ok"}, status=200)





