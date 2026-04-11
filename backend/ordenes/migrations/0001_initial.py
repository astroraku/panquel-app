from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='EstadoPrediccion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activa', models.BooleanField(default=True)),
                ('fecha', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Proveedor',
            fields=[
                ('id', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('telephone', models.CharField(blank=True, max_length=20, null=True)),
                ('email', models.EmailField(blank=True, max_length=254, null=True)),
            ],
            options={'db_table': 'proveedor'},
        ),
        migrations.CreateModel(
            name='Producto',
            fields=[
                ('nombre', models.CharField(max_length=100, primary_key=True, serialize=False)),
                ('cantidad', models.IntegerField()),
                ('proveedor', models.ForeignKey(db_column='proveedor_id', on_delete=django.db.models.deletion.CASCADE, to='ordenes.proveedor')),
            ],
            options={'db_table': 'producto'},
        ),
        migrations.CreateModel(
            name='Orden',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('activa', models.BooleanField(default=True)),
                ('proveedor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ordenes', to='ordenes.proveedor')),
            ],
        ),
        migrations.CreateModel(
            name='Prediccion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=255)),
                ('cantidad', models.IntegerField()), # Antes decía valor_predicho
                ('estado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ordenes.estadoprediccion')),
            ],
        ),
        migrations.CreateModel(
            name='DetalleOrden',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cantidad', models.PositiveIntegerField()),
                ('orden', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='detalles', to='ordenes.orden')),
                ('producto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ordenes.producto')),
            ],
        ),
    ]