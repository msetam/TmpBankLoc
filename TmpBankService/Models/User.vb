Imports System.ComponentModel
Imports System.ComponentModel.DataAnnotations
Imports System.ComponentModel.DataAnnotations.Schema

Namespace Models
    Public Class User

        Public Const ANONYMOUS_USER_ID = -1

        <Key, ScaffoldColumn(False), DatabaseGenerated(DatabaseGeneratedOption.Identity)>
        Public Property UserId As Integer

        <Required, Display(Name:="username"), MaxLength(50), Index(IsUnique:=True)>
        Public Property UserName As String


        <Required, Display(Name:="email"), MaxLength(50), Index(IsUnique:=True), DefaultValue("")>
        Public Property Email As String

        <Required>
        Public Property HashedPassword As String


        Public Overridable Property Transactions As ICollection(Of Transaction)

        Public Overridable Property Roles As ICollection(Of Role)

    End Class
End Namespace
