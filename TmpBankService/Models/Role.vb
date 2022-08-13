Imports System.ComponentModel.DataAnnotations
Imports System.ComponentModel.DataAnnotations.Schema

Namespace Models

    Public Enum RoleType
        COSTUMER
        ADMIN
        ANONYMOUS
    End Enum
    Public Class Role
        <Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)>
        Public Property RoleId As Integer

        <Required>
        Public Property RoleValue As RoleType

        <Required, ForeignKey("User")>
        Public Property UserId As Integer

        Public Property User As User

    End Class

End Namespace