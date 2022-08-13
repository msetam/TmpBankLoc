Imports System.Data.Entity

Namespace Models
    Public Class UserContext
        Inherits DbContext

        Public Property Users As DbSet(Of Models.User)

        Public Property Transactions As DbSet(Of Models.Transaction)

        Public Property Roles As DbSet(Of Models.Role)


        Public Sub New()
            MyBase.New(ConfigurationManager.ConnectionStrings("TmpBank").ConnectionString)
            Me.Configuration.ProxyCreationEnabled = True
            Me.Configuration.LazyLoadingEnabled = True
        End Sub

        ' TODO: it's not needed
        '        Protected Overrides Sub OnModelCreating(modelBuilder As DbModelBuilder)
        '            MyBase.OnModelCreating(modelBuilder)
        '            modelBuilder.Entity(Of Transaction) _
        '            .HasRequired(Of User)(Function(t) t.User) _
        '            .WithMany(Function(u) u.Transactions) _
        '            .HasForeignKey(Of Integer)(Function(t) t.UserId)
        '        End Sub
    End Class
End Namespace