-- Insert existing users into cl_users to retroactively fix accounts created before the trigger
INSERT INTO public.cl_users (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Function to handle new user insertion securely
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.cl_users (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically insert users into public schema when they sign up in auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
