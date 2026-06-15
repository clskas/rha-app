from rest_framework import permissions


class IsAdminOrRH(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'rh']


class IsAdminOrRHOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'rh', 'manager']


class IsAdminOrRHOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['admin', 'rh']


class IsAdminOrRHOrManagerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['admin', 'rh', 'manager']


class IsOwnerOrAdminOrRH(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['admin', 'rh']:
            return True
        if hasattr(obj, 'employee'):
            return obj.employee == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsOwnerOrAdminOrRHOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['admin', 'rh']

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role in ['admin', 'rh']:
            return True
        if hasattr(obj, 'employee'):
            return obj.employee == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
