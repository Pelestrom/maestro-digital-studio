
-- Public read + admin write policies for project-media bucket
CREATE POLICY "project-media public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'project-media');

CREATE POLICY "project-media admin insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "project-media admin update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "project-media admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));
