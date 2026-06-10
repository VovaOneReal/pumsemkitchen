-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "recipes" (
	"recipe_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"edited_by_user_id" integer,
	"title" varchar(32) NOT NULL,
	"description" text,
	"cooking_time_min" integer,
	"portions" integer DEFAULT 4 NOT NULL,
	"created_at" date NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"picture_url" text,
	"edited_at" date NOT NULL,
	CONSTRAINT "ckc_portions_recipes" CHECK (portions >= 0)
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"collection_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"edited_by_user_id" integer,
	"title" varchar(32) NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" date NOT NULL,
	"edited_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"login" varchar(32) NOT NULL,
	"password" varchar(1024) NOT NULL,
	"name" varchar(32) NOT NULL,
	"created_at" date NOT NULL,
	"avatar_url" text,
	"role" varchar(32) NOT NULL,
	CONSTRAINT "ckc_role_users" CHECK ((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "measurement_units" (
	"measurement_unit_id" serial PRIMARY KEY NOT NULL,
	"unit_name" varchar(50) NOT NULL,
	"unit_plural_name" varchar(32),
	"is_standart" boolean NOT NULL,
	"measure_type" varchar(32) NOT NULL,
	CONSTRAINT "ckc_measure_type_measurem" CHECK ((measure_type)::text = ANY ((ARRAY['piece'::character varying, 'weight'::character varying, 'volume'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "convertation_coefficients" (
	"convertation_id" serial PRIMARY KEY NOT NULL,
	"measurement_unit_from_id" integer NOT NULL,
	"measurement_unit_to_id" integer NOT NULL,
	"coefficient" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emiss_goods" (
	"emiss_goods_id" serial PRIMARY KEY NOT NULL,
	"emiss_goods_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "families" (
	"family_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(32) NOT NULL,
	"created_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"menu_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"edited_by_user_id" integer,
	"menu_title" varchar(128) NOT NULL,
	"created_at" date NOT NULL,
	"edited_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"product_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"measurement_unit_id" integer NOT NULL,
	"emiss_goods_id" integer,
	"fdc_id" integer,
	"edited_by_user_id" integer,
	"title" varchar(32) NOT NULL,
	"quantity_price" numeric DEFAULT '0' NOT NULL,
	"user_price" numeric DEFAULT '0',
	"user_calories" numeric DEFAULT '0',
	"user_proteins" numeric DEFAULT '0',
	"user_fats" numeric DEFAULT '0',
	"user_carbs" numeric DEFAULT '0',
	"created_at" date NOT NULL,
	"edited_at" date NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	CONSTRAINT "ckc_user_fats_products" CHECK ((user_fats IS NULL) OR (user_fats >= (0)::numeric)),
	CONSTRAINT "ckc_quantity_price_products" CHECK (quantity_price >= (0)::numeric),
	CONSTRAINT "ckc_user_price_products" CHECK ((user_price IS NULL) OR (user_price >= (0)::numeric)),
	CONSTRAINT "ckc_user_calories_products" CHECK ((user_calories IS NULL) OR (user_calories >= (0)::numeric)),
	CONSTRAINT "ckc_user_proteins_products" CHECK ((user_proteins IS NULL) OR (user_proteins >= (0)::numeric)),
	CONSTRAINT "ckc_user_carbs_products" CHECK ((user_carbs IS NULL) OR (user_carbs >= (0)::numeric))
);
--> statement-breakpoint
CREATE TABLE "shopping_lists" (
	"shopping_list_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"edited_by_user_id" integer,
	"title" varchar(32) NOT NULL,
	"created_at" date NOT NULL,
	"edited_at" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fdc_food" (
	"fdc_id" integer PRIMARY KEY NOT NULL,
	"fdc_name" text NOT NULL,
	"fdc_translated_name" text
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"grade_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"recipe_id" integer NOT NULL,
	"grade" integer NOT NULL,
	"created_at" date NOT NULL,
	CONSTRAINT "ckc_grade_grades" CHECK ((grade >= 0) AND (grade <= 5))
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"ingredient_id" serial PRIMARY KEY NOT NULL,
	"recipe_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"measurement_unit_id" integer NOT NULL,
	"quantity" numeric DEFAULT '1' NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"note" varchar(128),
	CONSTRAINT "ckc_quantity_ingredie" CHECK (quantity >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"invite_id" serial PRIMARY KEY NOT NULL,
	"family_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" date NOT NULL,
	CONSTRAINT "ckc_status_invitati" CHECK ((status)::text = ANY ((ARRAY['sent'::character varying, 'accepted'::character varying, 'denied'::character varying, 'cancelled'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"meal_id" serial PRIMARY KEY NOT NULL,
	"plan_date_id" integer NOT NULL,
	"meal_title" varchar(32) NOT NULL,
	"meal_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "list_elements" (
	"element_id" serial PRIMARY KEY NOT NULL,
	"shopping_list_id" integer NOT NULL,
	"product_id" integer,
	"meal_id" integer,
	"measurement_unit_id" integer NOT NULL,
	"user_id" integer,
	"is_checked" boolean NOT NULL,
	"user_title" varchar(255),
	"quantity" numeric DEFAULT '1' NOT NULL,
	"is_manual" boolean NOT NULL,
	CONSTRAINT "ckc_quantity_list_ele" CHECK (quantity >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "plan_dates" (
	"plan_date_id" serial PRIMARY KEY NOT NULL,
	"menu_id" integer NOT NULL,
	"plan_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_recipes" (
	"recipe_id" integer NOT NULL,
	"collection_id" integer NOT NULL,
	CONSTRAINT "pk_collection_recipes" PRIMARY KEY("recipe_id","collection_id")
);
--> statement-breakpoint
CREATE TABLE "meal_recipes" (
	"recipe_id" integer NOT NULL,
	"meal_id" integer NOT NULL,
	CONSTRAINT "pk_meal_recipes" PRIMARY KEY("recipe_id","meal_id")
);
--> statement-breakpoint
CREATE TABLE "shopping_list_menus" (
	"menu_id" integer NOT NULL,
	"shopping_list_id" integer NOT NULL,
	CONSTRAINT "pk_shopping_list_menus" PRIMARY KEY("shopping_list_id","menu_id")
);
--> statement-breakpoint
CREATE TABLE "user_a_member_of_families" (
	"family_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "pk_user_a_member_of_families" PRIMARY KEY("user_id","family_id")
);
--> statement-breakpoint
CREATE TABLE "emiss_records" (
	"emiss_goods_id" integer NOT NULL,
	"record_date" date NOT NULL,
	"record_price" numeric NOT NULL,
	CONSTRAINT "pk_emiss_records" PRIMARY KEY("record_date","emiss_goods_id")
);
--> statement-breakpoint
CREATE TABLE "family_collections_access" (
	"family_id" integer NOT NULL,
	"collection_id" integer NOT NULL,
	"can_view" boolean DEFAULT false NOT NULL,
	"can_edit" boolean DEFAULT false NOT NULL,
	CONSTRAINT "pk_family_collections_access" PRIMARY KEY("family_id","collection_id")
);
--> statement-breakpoint
CREATE TABLE "family_menus_access" (
	"menu_id" integer NOT NULL,
	"family_id" integer NOT NULL,
	"can_view" boolean DEFAULT false NOT NULL,
	"can_edit" boolean DEFAULT false NOT NULL,
	CONSTRAINT "pk_family_menus_access" PRIMARY KEY("menu_id","family_id")
);
--> statement-breakpoint
CREATE TABLE "family_products_access" (
	"product_id" integer NOT NULL,
	"family_id" integer NOT NULL,
	"can_view" boolean DEFAULT false NOT NULL,
	"can_edit" boolean DEFAULT false NOT NULL,
	CONSTRAINT "pk_family_products_access" PRIMARY KEY("product_id","family_id")
);
--> statement-breakpoint
CREATE TABLE "family_recipes_access" (
	"recipe_id" integer NOT NULL,
	"family_id" integer NOT NULL,
	"can_view" boolean DEFAULT false NOT NULL,
	"can_edit" boolean DEFAULT false NOT NULL,
	CONSTRAINT "pk_family_recipes_access" PRIMARY KEY("recipe_id","family_id")
);
--> statement-breakpoint
CREATE TABLE "family_shopping_lists_access" (
	"shopping_list_id" integer NOT NULL,
	"family_id" integer NOT NULL,
	"can_view" boolean DEFAULT false NOT NULL,
	"can_edit" boolean DEFAULT false NOT NULL,
	CONSTRAINT "pk_family_shopping_lists_acces" PRIMARY KEY("shopping_list_id","family_id")
);
--> statement-breakpoint
CREATE TABLE "recipe_steps" (
	"recipe_id" integer NOT NULL,
	"order" numeric NOT NULL,
	"description" text NOT NULL,
	"picture_url" text,
	CONSTRAINT "pk_recipe_steps" PRIMARY KEY("recipe_id","order")
);
--> statement-breakpoint
CREATE TABLE "fdc_records" (
	"fdc_id" integer NOT NULL,
	"fdc_research_date" date NOT NULL,
	"fdc_calories" numeric NOT NULL,
	"fdc_carbs" numeric NOT NULL,
	"fdc_fats" numeric NOT NULL,
	"fdc_proteins" numeric NOT NULL,
	CONSTRAINT "pk_fdc_records" PRIMARY KEY("fdc_research_date","fdc_id")
);
--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "fk_recipes_user_edit_users" FOREIGN KEY ("edited_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "fk_recipes_user_reci_users" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "fk_collecti_user_coll_users" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "fk_collecti_user_edit_users" FOREIGN KEY ("edited_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "convertation_coefficients" ADD CONSTRAINT "fk_converta_from_meas_measurem" FOREIGN KEY ("measurement_unit_from_id") REFERENCES "public"."measurement_units"("measurement_unit_id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "convertation_coefficients" ADD CONSTRAINT "fk_converta_to_measur_measurem" FOREIGN KEY ("measurement_unit_to_id") REFERENCES "public"."measurement_units"("measurement_unit_id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "families" ADD CONSTRAINT "fk_families_user_fami_users" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "fk_menus_user_edit_users" FOREIGN KEY ("edited_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "fk_menus_user_menu_users" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "fk_products_product_e_emiss_go" FOREIGN KEY ("emiss_goods_id") REFERENCES "public"."emiss_goods"("emiss_goods_id") ON DELETE set null ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "fk_products_product_f_fdc_food" FOREIGN KEY ("fdc_id") REFERENCES "public"."fdc_food"("fdc_id") ON DELETE set null ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "fk_products_product_m_measurem" FOREIGN KEY ("measurement_unit_id") REFERENCES "public"."measurement_units"("measurement_unit_id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "fk_products_user_edit_users" FOREIGN KEY ("edited_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "fk_products_user_prod_users" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "shopping_lists" ADD CONSTRAINT "fk_shopping_user_edit_users" FOREIGN KEY ("edited_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shopping_lists" ADD CONSTRAINT "fk_shopping_user_shop_users" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "fk_grades_recipe_gr_recipes" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "fk_grades_user_grad_users" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "fk_ingredie_ingredien_recipes" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "fk_ingredie_measureme_measurem" FOREIGN KEY ("measurement_unit_id") REFERENCES "public"."measurement_units"("measurement_unit_id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "fk_ingredie_product_i_products" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "fk_invitati_family_in_families" FOREIGN KEY ("family_id") REFERENCES "public"."families"("family_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "fk_invitati_user_invi_users" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "fk_meals_plan_date_plan_dat" FOREIGN KEY ("plan_date_id") REFERENCES "public"."plan_dates"("plan_date_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "list_elements" ADD CONSTRAINT "fk_list_ele_list_elem_meals" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("meal_id") ON DELETE set null ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "list_elements" ADD CONSTRAINT "fk_list_ele_list_elem_measurem" FOREIGN KEY ("measurement_unit_id") REFERENCES "public"."measurement_units"("measurement_unit_id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "list_elements" ADD CONSTRAINT "fk_list_ele_list_elem_products" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE set null ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "list_elements" ADD CONSTRAINT "fk_list_ele_shopping__shopping" FOREIGN KEY ("shopping_list_id") REFERENCES "public"."shopping_lists"("shopping_list_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "list_elements" ADD CONSTRAINT "fk_list_ele_user_adds_users" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "plan_dates" ADD CONSTRAINT "fk_plan_dat_menu_plan_menus" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("menu_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "collection_recipes" ADD CONSTRAINT "fk_collecti_collectio_recipes" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "collection_recipes" ADD CONSTRAINT "fk_collecti_collectio_collecti" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("collection_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "meal_recipes" ADD CONSTRAINT "fk_meal_rec_meal_reci_recipes" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "meal_recipes" ADD CONSTRAINT "fk_meal_rec_meal_reci_meals" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("meal_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "shopping_list_menus" ADD CONSTRAINT "fk_shopping_shopping__menus" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("menu_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "shopping_list_menus" ADD CONSTRAINT "fk_shopping_shopping__shopping" FOREIGN KEY ("shopping_list_id") REFERENCES "public"."shopping_lists"("shopping_list_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "user_a_member_of_families" ADD CONSTRAINT "fk_user_a_m_user_a_me_families" FOREIGN KEY ("family_id") REFERENCES "public"."families"("family_id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "user_a_member_of_families" ADD CONSTRAINT "fk_user_a_m_user_a_me_users" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "emiss_records" ADD CONSTRAINT "fk_emiss_re_emiss_goo_emiss_go" FOREIGN KEY ("emiss_goods_id") REFERENCES "public"."emiss_goods"("emiss_goods_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "family_collections_access" ADD CONSTRAINT "fk_family_c_collectio_collecti" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("collection_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "family_collections_access" ADD CONSTRAINT "fk_family_c_family_co_families" FOREIGN KEY ("family_id") REFERENCES "public"."families"("family_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "family_menus_access" ADD CONSTRAINT "fk_family_m_family_me_families" FOREIGN KEY ("family_id") REFERENCES "public"."families"("family_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "family_menus_access" ADD CONSTRAINT "fk_family_m_menu_fami_menus" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("menu_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "family_products_access" ADD CONSTRAINT "fk_family_p_family_pr_families" FOREIGN KEY ("family_id") REFERENCES "public"."families"("family_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "family_products_access" ADD CONSTRAINT "fk_family_p_product_f_products" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "family_recipes_access" ADD CONSTRAINT "fk_family_r_family_re_families" FOREIGN KEY ("family_id") REFERENCES "public"."families"("family_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "family_recipes_access" ADD CONSTRAINT "fk_family_r_recipe_fa_recipes" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "family_shopping_lists_access" ADD CONSTRAINT "fk_family_s_family_sh_families" FOREIGN KEY ("family_id") REFERENCES "public"."families"("family_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "family_shopping_lists_access" ADD CONSTRAINT "fk_family_s_shopping__shopping" FOREIGN KEY ("shopping_list_id") REFERENCES "public"."shopping_lists"("shopping_list_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "recipe_steps" ADD CONSTRAINT "fk_recipe_s_recipe_re_recipes" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "fdc_records" ADD CONSTRAINT "fk_fdc_reco_fdc_food__fdc_food" FOREIGN KEY ("fdc_id") REFERENCES "public"."fdc_food"("fdc_id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
CREATE INDEX "recipe_title_index" ON "recipes" USING btree ("title" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "recipes_pk" ON "recipes" USING btree ("recipe_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_edits_recipes_fk" ON "recipes" USING btree ("edited_by_user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_recipes_fk" ON "recipes" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "collection_title_index" ON "collections" USING btree ("title" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "collections_pk" ON "collections" USING btree ("collection_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_collections_fk" ON "collections" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_edits_collections_fk" ON "collections" USING btree ("edited_by_user_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_pk" ON "users" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "measurement_units_pk" ON "measurement_units" USING btree ("measurement_unit_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "convertation_coefficients_pk" ON "convertation_coefficients" USING btree ("convertation_id" int4_ops);--> statement-breakpoint
CREATE INDEX "from_measurement_unit_fk" ON "convertation_coefficients" USING btree ("measurement_unit_from_id" int4_ops);--> statement-breakpoint
CREATE INDEX "to_measurement_unit_fk" ON "convertation_coefficients" USING btree ("measurement_unit_to_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "emiss_goods_name_index" ON "emiss_goods" USING btree ("emiss_goods_name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "emiss_goods_pk" ON "emiss_goods" USING btree ("emiss_goods_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "families_pk" ON "families" USING btree ("family_id" int4_ops);--> statement-breakpoint
CREATE INDEX "family_title_index" ON "families" USING btree ("title" text_ops);--> statement-breakpoint
CREATE INDEX "user_families_fk" ON "families" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "menu_title_index" ON "menus" USING btree ("menu_title" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "menus_pk" ON "menus" USING btree ("menu_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_edits_menus_fk" ON "menus" USING btree ("edited_by_user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_menus_fk" ON "menus" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "product_emiss_goods_fk" ON "products" USING btree ("emiss_goods_id" int4_ops);--> statement-breakpoint
CREATE INDEX "product_fdc_data_fk" ON "products" USING btree ("fdc_id" int4_ops);--> statement-breakpoint
CREATE INDEX "product_measurement_units_fk" ON "products" USING btree ("measurement_unit_id" int4_ops);--> statement-breakpoint
CREATE INDEX "product_title_index" ON "products" USING btree ("title" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "products_pk" ON "products" USING btree ("product_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_edits_products_fk" ON "products" USING btree ("edited_by_user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_products_fk" ON "products" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "shopping_lists_pk" ON "shopping_lists" USING btree ("shopping_list_id" int4_ops);--> statement-breakpoint
CREATE INDEX "shopping_lists_title_index" ON "shopping_lists" USING btree ("title" text_ops);--> statement-breakpoint
CREATE INDEX "user_edits_shopping_lists_fk" ON "shopping_lists" USING btree ("edited_by_user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_shopping_lists_fk" ON "shopping_lists" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "fdc_food_pk" ON "fdc_food" USING btree ("fdc_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "fdc_name_index" ON "fdc_food" USING btree ("fdc_name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "grades_pk" ON "grades" USING btree ("grade_id" int4_ops);--> statement-breakpoint
CREATE INDEX "recipe_grades_fk" ON "grades" USING btree ("recipe_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_grades_fk" ON "grades" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "ingredient_recipes_fk" ON "ingredients" USING btree ("recipe_id" int4_ops);--> statement-breakpoint
CREATE INDEX "measurement_unit_ingredients_fk" ON "ingredients" USING btree ("measurement_unit_id" int4_ops);--> statement-breakpoint
CREATE INDEX "product_ingredients_fk" ON "ingredients" USING btree ("product_id" int4_ops);--> statement-breakpoint
CREATE INDEX "family_invites_fk" ON "invitations" USING btree ("family_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_pk" ON "invitations" USING btree ("invite_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_invitations_fk" ON "invitations" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "meals_pk" ON "meals" USING btree ("meal_id" int4_ops);--> statement-breakpoint
CREATE INDEX "plan_date_meals_fk" ON "meals" USING btree ("plan_date_id" int4_ops);--> statement-breakpoint
CREATE INDEX "list_elem_measure_units_fk" ON "list_elements" USING btree ("measurement_unit_id" int4_ops);--> statement-breakpoint
CREATE INDEX "list_element_meals_fk" ON "list_elements" USING btree ("meal_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "list_elements_pk" ON "list_elements" USING btree ("element_id" int4_ops);--> statement-breakpoint
CREATE INDEX "list_elements_products_fk" ON "list_elements" USING btree ("product_id" int4_ops);--> statement-breakpoint
CREATE INDEX "shopping_list_list_elements_fk" ON "list_elements" USING btree ("shopping_list_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_adds_elements_fk" ON "list_elements" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "menu_plan_dates_fk" ON "plan_dates" USING btree ("menu_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "plan_dates_pk" ON "plan_dates" USING btree ("plan_date_id" int4_ops);--> statement-breakpoint
CREATE INDEX "collection_recipes2_fk" ON "collection_recipes" USING btree ("collection_id" int4_ops);--> statement-breakpoint
CREATE INDEX "collection_recipes_fk" ON "collection_recipes" USING btree ("recipe_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "collection_recipes_pk" ON "collection_recipes" USING btree ("recipe_id" int4_ops,"collection_id" int4_ops);--> statement-breakpoint
CREATE INDEX "meal_recipes2_fk" ON "meal_recipes" USING btree ("meal_id" int4_ops);--> statement-breakpoint
CREATE INDEX "meal_recipes_fk" ON "meal_recipes" USING btree ("recipe_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "meal_recipes_pk" ON "meal_recipes" USING btree ("recipe_id" int4_ops,"meal_id" int4_ops);--> statement-breakpoint
CREATE INDEX "shopping_list_menus2_fk" ON "shopping_list_menus" USING btree ("shopping_list_id" int4_ops);--> statement-breakpoint
CREATE INDEX "shopping_list_menus_fk" ON "shopping_list_menus" USING btree ("menu_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "shopping_list_menus_pk" ON "shopping_list_menus" USING btree ("menu_id" int4_ops,"shopping_list_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_a_member_of_families2_fk" ON "user_a_member_of_families" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_a_member_of_families_fk" ON "user_a_member_of_families" USING btree ("family_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_a_member_of_families_pk" ON "user_a_member_of_families" USING btree ("family_id" int4_ops,"user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "emiss_good_emiss_records_fk" ON "emiss_records" USING btree ("emiss_goods_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "emiss_records_pk" ON "emiss_records" USING btree ("emiss_goods_id" int4_ops,"record_date" int4_ops);--> statement-breakpoint
CREATE INDEX "col_fam_access_fk" ON "family_collections_access" USING btree ("collection_id" int4_ops);--> statement-breakpoint
CREATE INDEX "fam_col_access_fk" ON "family_collections_access" USING btree ("family_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "family_collections_access_pk" ON "family_collections_access" USING btree ("family_id" int4_ops,"collection_id" int4_ops);--> statement-breakpoint
CREATE INDEX "family_menus_access_link_fk" ON "family_menus_access" USING btree ("family_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "family_menus_access_pk" ON "family_menus_access" USING btree ("menu_id" int4_ops,"family_id" int4_ops);--> statement-breakpoint
CREATE INDEX "menu_families_access_link_fk" ON "family_menus_access" USING btree ("menu_id" int4_ops);--> statement-breakpoint
CREATE INDEX "family_products_access_link_fk" ON "family_products_access" USING btree ("family_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "family_products_access_pk" ON "family_products_access" USING btree ("product_id" int4_ops,"family_id" int4_ops);--> statement-breakpoint
CREATE INDEX "product_families_access_link_fk" ON "family_products_access" USING btree ("product_id" int4_ops);--> statement-breakpoint
CREATE INDEX "family_recipes_access_link_fk" ON "family_recipes_access" USING btree ("family_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "family_recipes_access_pk" ON "family_recipes_access" USING btree ("recipe_id" int4_ops,"family_id" int4_ops);--> statement-breakpoint
CREATE INDEX "recipe_families_access_link_fk" ON "family_recipes_access" USING btree ("recipe_id" int4_ops);--> statement-breakpoint
CREATE INDEX "fam_shop_lists_access_fk" ON "family_shopping_lists_access" USING btree ("family_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "family_shopping_lists_access_pk" ON "family_shopping_lists_access" USING btree ("shopping_list_id" int4_ops,"family_id" int4_ops);--> statement-breakpoint
CREATE INDEX "shop_list_fam_access_fk" ON "family_shopping_lists_access" USING btree ("shopping_list_id" int4_ops);--> statement-breakpoint
CREATE INDEX "recipe_recipe_steps_fk" ON "recipe_steps" USING btree ("recipe_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_steps_pk" ON "recipe_steps" USING btree ("recipe_id" numeric_ops,"order" int4_ops);--> statement-breakpoint
CREATE INDEX "fdc_food_fdc_record_fk" ON "fdc_records" USING btree ("fdc_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "fdc_records_pk" ON "fdc_records" USING btree ("fdc_id" int4_ops,"fdc_research_date" int4_ops);
*/