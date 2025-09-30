app.conf.beat_schedule.update({
    "expire-free-posts-daily": {
        "task": "property.tasks.expire_free_posts",
        "schedule": 86400,  # once daily
    }
})
