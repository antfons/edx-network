from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now


class User(AbstractUser):
    following = models.ManyToManyField("User", related_name="followers", symmetrical=False)
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "following": [ {"id": user.id, "username": user.username} for user in self.following.all()],
            "followers": [ {"id": user.id, "username": user.username} for user in self.followers.all()]
        }


class Post(models.Model):
    post_owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="post_owner"
    )
    text = models.CharField(max_length=2000)
    likes = models.ManyToManyField("User", related_name="liked")
    creation_date = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "post_owner": {"id": self.post_owner.id, "username": self.post_owner.username},
            "text": self.text,
            "likes": [{"id": user.id, "username": user.username} for user in self.likes.all()],
            "creation_date": self.creation_date.strftime("%b %-d %Y, %-I:%M %p")
        }
