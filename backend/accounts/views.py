from rest_framework import viewsets, permissions, generics, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.contrib.auth.hashers import check_password
from drf_spectacular.utils import extend_schema
from .models import User
from .serializers import UserSerializer, RegisterSerializer
from permissions import IsAdminOrRH


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)


@extend_schema(request=ChangePasswordSerializer, responses={200: None, 400: None})
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    user = request.user
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'detail': 'Champs requis'}, status=status.HTTP_400_BAD_REQUEST)
    if not check_password(serializer.validated_data['old_password'], user.password):
        return Response({'detail': 'Ancien mot de passe incorrect'}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return Response({'detail': 'Mot de passe modifié avec succès'})


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRH]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'manager':
            return User.objects.filter(role='employee')
        return User.objects.all()

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)