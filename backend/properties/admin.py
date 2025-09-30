# backend/properties/admin.py
from django.contrib import admin
from django.contrib import messages
from django.utils.html import format_html
from django.utils.timezone import now, timedelta
from .models.listings import PropertyListing
from .models.units import ApartmentUnit
from .models.media import PropertyMedia
from .models.inspection import InspectionBooking
from .models.messaging import MessageThread, Message
from .models.engagement import ListingEngagement
from properties.models.boost import BoostPackage, BoostPurchase, PlatformSetting


@admin.register(PropertyListing)
class PropertyListingAdmin(admin.ModelAdmin):
    list_display = ("property_uid", "title", "owner", "listing_type", "price", "is_published", "is_boosted", "created_at")
    list_filter = ("listing_type", "is_published", "is_boosted", "created_at")
    search_fields = ("property_uid", "title", "owner__email", "agent__email", "description")
    readonly_fields = ("property_uid", "slug", "created_at", "updated_at")
    actions = ['publish_listings', 'unpublish_listings', 'boost_listings', 'unboost_listings']
    
    fieldsets = (
        ("Basic Information", {
            'fields': ('property_uid', 'title', 'slug', 'listing_type', 'description')
        }),
        ("Pricing", {
            'fields': ('price', 'currency', 'service_charge')
        }),
        ("Location", {
            'fields': ('location', 'address')
        }),
        ("Specifications", {
            'fields': ('bedrooms', 'bathrooms', 'toilets', 'facilities')
        }),
        ("Status", {
            'fields': ('is_published', 'ranking_score', 'boost_until', 'is_boosted', 'expires_at')
        }),
        ("Relationships", {
            'fields': ('owner', 'agent')
        }),
        ("Timestamps", {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def publish_listings(self, request, queryset):
        updated = queryset.update(is_published=True)
        self.message_user(
            request, 
            f"Successfully published {updated} listing(s).", 
            messages.SUCCESS
        )
    publish_listings.short_description = "Publish selected listings"

    def unpublish_listings(self, request, queryset):
        updated = queryset.update(is_published=False)
        self.message_user(
            request, 
            f"Successfully unpublished {updated} listing(s).", 
            messages.SUCCESS
        )
    unpublish_listings.short_description = "Unpublish selected listings"

    def boost_listings(self, request, queryset):
        # Boost listings for 7 days
        boost_until = now() + timedelta(days=7)
        updated = queryset.update(boost_until=boost_until, is_boosted=True)
        self.message_user(
            request, 
            f"Successfully boosted {updated} listing(s) for 7 days.", 
            messages.SUCCESS
        )
    boost_listings.short_description = "Boost selected listings (7 days)"

    def unboost_listings(self, request, queryset):
        updated = queryset.update(boost_until=None, is_boosted=False)
        self.message_user(
            request, 
            f"Successfully removed boost from {updated} listing(s).", 
            messages.SUCCESS
        )
    unboost_listings.short_description = "Remove boost from selected listings"


@admin.register(ApartmentUnit)
class ApartmentUnitAdmin(admin.ModelAdmin):
    list_display = ("uid", "listing", "name", "apartment_type", "rent_amount", "is_available", "created_at")
    list_filter = ("apartment_type", "is_available", "listing__listing_type")
    search_fields = ("uid", "name", "listing__title", "listing__property_uid")
    readonly_fields = ("uid", "created_at", "updated_at")
    actions = ['mark_units_available', 'mark_units_unavailable']

    def mark_units_available(self, request, queryset):
        updated = queryset.update(is_available=True)
        self.message_user(
            request, 
            f"Successfully marked {updated} unit(s) as available.", 
            messages.SUCCESS
        )
    mark_units_available.short_description = "Mark selected units as available"

    def mark_units_unavailable(self, request, queryset):
        updated = queryset.update(is_available=False)
        self.message_user(
            request, 
            f"Successfully marked {updated} unit(s) as unavailable.", 
            messages.SUCCESS
        )
    mark_units_unavailable.short_description = "Mark selected units as unavailable"


@admin.register(PropertyMedia)
class PropertyMediaAdmin(admin.ModelAdmin):
    list_display = ("id", "listing", "media_type", "is_cover", "created_at")
    list_filter = ("media_type", "is_cover")
    search_fields = ("listing__title", "caption")
    readonly_fields = ("created_at", "updated_at")
    actions = ['set_as_cover', 'remove_cover_status']

    def set_as_cover(self, request, queryset):
        if queryset.count() > 1:
            self.message_user(
                request, 
                "Please select only one media item to set as cover.", 
                messages.ERROR
            )
            return
        
        media = queryset.first()
        # This will trigger the save method which handles cover logic
        media.is_cover = True
        media.save()
        self.message_user(
            request, 
            f"Successfully set media as cover for {media.listing.title}.", 
            messages.SUCCESS
        )
    set_as_cover.short_description = "Set selected media as cover photo"

    def remove_cover_status(self, request, queryset):
        updated = queryset.update(is_cover=False)
        self.message_user(
            request, 
            f"Successfully removed cover status from {updated} media item(s).", 
            messages.SUCCESS
        )
    remove_cover_status.short_description = "Remove cover status from selected media"


@admin.register(InspectionBooking)
class InspectionBookingAdmin(admin.ModelAdmin):
    list_display = ("id", "listing", "unit", "tenant", "scheduled_date", "status", "created_at")
    list_filter = ("status", "scheduled_date")
    search_fields = ("listing__title", "tenant__email", "unit__name")
    readonly_fields = ("created_at", "updated_at")
    list_editable = ("status",)
    actions = [
        'mark_as_completed', 
        'mark_as_approved', 
        'mark_as_rejected', 
        'mark_as_cancelled'
    ]

    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status=InspectionBooking.Status.COMPLETED)
        self.message_user(
            request, 
            f"Successfully marked {updated} inspection(s) as completed.", 
            messages.SUCCESS
        )
    mark_as_completed.short_description = "Mark selected inspections as completed"

    def mark_as_approved(self, request, queryset):
        updated = queryset.update(status=InspectionBooking.Status.APPROVED)
        self.message_user(
            request, 
            f"Successfully approved {updated} inspection(s).", 
            messages.SUCCESS
        )
    mark_as_approved.short_description = "Approve selected inspections"

    def mark_as_rejected(self, request, queryset):
        updated = queryset.update(status=InspectionBooking.Status.REJECTED)
        self.message_user(
            request, 
            f"Successfully rejected {updated} inspection(s).", 
            messages.SUCCESS
        )
    mark_as_rejected.short_description = "Reject selected inspections"

    def mark_as_cancelled(self, request, queryset):
        updated = queryset.update(status=InspectionBooking.Status.CANCELLED)
        self.message_user(
            request, 
            f"Successfully cancelled {updated} inspection(s).", 
            messages.SUCCESS
        )
    mark_as_cancelled.short_description = "Cancel selected inspections"


@admin.register(MessageThread)
class MessageThreadAdmin(admin.ModelAdmin):
    list_display = ("id", "subject", "listing", "created_by", "message_count", "is_active", "created_at")
    list_filter = ("created_at", "is_active")
    search_fields = ("subject", "listing__title", "created_by__email")
    readonly_fields = ("created_at", "updated_at")
    actions = ['archive_threads', 'activate_threads']

    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = "Messages"

    def archive_threads(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(
            request, 
            f"Successfully archived {updated} thread(s).", 
            messages.SUCCESS
        )
    archive_threads.short_description = "Archive selected threads"

    def activate_threads(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(
            request, 
            f"Successfully activated {updated} thread(s).", 
            messages.SUCCESS
        )
    activate_threads.short_description = "Activate selected threads"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "thread", "sender", "body_preview", "created_at")
    list_filter = ("created_at",)
    search_fields = ("body", "sender__email", "thread__subject")
    readonly_fields = ("created_at", "updated_at")

    def body_preview(self, obj):
        return obj.body[:50] + "..." if len(obj.body) > 50 else obj.body
    body_preview.short_description = "Message Preview"


@admin.register(ListingEngagement)
class ListingEngagementAdmin(admin.ModelAdmin):
    list_display = ("listing", "views", "inspections", "inquiries", "last_viewed", "updated_at")
    readonly_fields = ("views", "inspections", "inquiries", "last_viewed", "created_at", "updated_at")
    search_fields = ("listing__title", "listing__property_uid")
    actions = ['reset_engagement_metrics']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def reset_engagement_metrics(self, request, queryset):
        updated = queryset.update(views=0, inspections=0, inquiries=0, last_viewed=None)
        self.message_user(
            request, 
            f"Successfully reset engagement metrics for {updated} listing(s).", 
            messages.SUCCESS
        )
    reset_engagement_metrics.short_description = "Reset engagement metrics to zero"




@admin.register(BoostPackage)
class BoostPackageAdmin(admin.ModelAdmin):
    list_display = ("uid", "name", "price", "duration_days", "active")
    search_fields = ("name", "uid")
    list_filter = ("active",)

@admin.register(BoostPurchase)
class BoostPurchaseAdmin(admin.ModelAdmin):
    list_display = ("uid", "listing", "buyer", "amount", "status", "purchased_at", "starts_at", "ends_at")
    search_fields = ("uid", "listing__title", "buyer__email", "reference")
    list_filter = ("status",)

@admin.register(PlatformSetting)
class PlatformSettingAdmin(admin.ModelAdmin):
    list_display = ("key", "updated_at")
    readonly_fields = ("updated_at",)
