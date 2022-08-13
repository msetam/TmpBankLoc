Imports System.ComponentModel.DataAnnotations
Imports System.ComponentModel.DataAnnotations.Schema

Namespace Models
    Public Enum TransactionMethod
        TRANSFER
        INTEREST
        RECEIVE
    End Enum

    Public Enum TransactionType
        PAYA
        SATNA
    End Enum


    Public Class Transaction
        <Key, ScaffoldColumn(False), DatabaseGenerated(DatabaseGeneratedOption.Identity)>
        Public Property TransactionId As Integer

        <Required>
        Public Property Method As TransactionMethod

        <Required>
        Public Property Type As TransactionType

        
        <Required>
        Public  Property  Amount() As Integer

        <Required, ForeignKey("User")>
        Public Property UserId As Integer

        <Required>
        Public Property ToUserId As Integer


        Public Property User As User

        Public ReadOnly Property PublicTransactionId() As Integer
            Get
                Return TransactionId + 1000
            End Get
        End Property
    End Class
End Namespace
