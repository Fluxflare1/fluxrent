# backend/properties/models/messaging.py
import uuid
from django.db import models
from django.conf import settings
from django.utils.timezone import now


class MessageThread(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(
        "PropertyListing", 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="message_threads"
    )
    subject = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="threads_created"
    )
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name="threads_participating"
    )
    is_active = models.BooleanField(default=True)  # Added for thread management
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Added for consistency

    class Meta:
        ordering = ["-updated_at"]  # Order by last activity
        indexes = [
            models.Index(fields=["listing", "created_at"]),
            models.Index(fields=["created_by", "created_at"]),
        ]

    def __str__(self):
        listing_info = f" - {self.listing.title}" if self.listing else ""
        return f"Thread: {self.subject or 'No Subject'}{listing_info}"

    def last_message(self):
        """Get the most recent message in the thread"""
        return self.messages.order_by('-created_at').first()

    def unread_count(self, user):
        """Get unread message count for a specific user"""
        return self.messages.exclude(read_by=user).count()

    def mark_read(self, user):
        """Mark all messages in thread as read for a user"""
        self.messages.exclude(read_by=user).update(read_by=user)


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey(
        MessageThread, 
        on_delete=models.CASCADE, 
        related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="sent_messages"
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Added for consistency
    read_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name="read_messages", 
        blank=True
    )

    class Meta:
        ordering = ["created_at"]  # Chronological order for messages
        indexes = [
            models.Index(fields=["thread", "created_at"]),
            models.Index(fields=["sender", "created_at"]),
        ]

    def __str__(self):
        return f"Message from {self.sender} in {self.thread}"

    def save(self, *args, **kwargs):
        """Update thread's updated_at when new message is added"""
        super().save(*args, **kwargs)
        # Update the thread's updated_at timestamp
        MessageThread.objects.filter(id=self.thread.id).update(updated_at=now())

    def is_read_by(self, user):
        """Check if message has been read by a specific user"""
        return self.read_by.filter(id=user.id).exists()
