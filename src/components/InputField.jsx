const INPUT_BASE_CLASS = `w-full rounded-md bg-white/80 border border-zinc-300 
  text-zinc-900 placeholder-zinc-600 dark:bg-black/40 dark:border-white/10 dark:text-white 
  dark:placeholder-white/40 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500`;
export default function InputField({
  value,
  name,
  type = "text",
  placeholder,
  onChange,
  onBlur,
  error,
  touched,
  label,
  hideLabel
}) {
  return (
    <div>
      <label
        className={
          hideLabel ? "sr-only" : "text-shadow-amber-50 pl-1 pb-1 text-xs"
        }
        htmlFor={name}
      >
        {label}
      </label>
      <input
        id={name}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        name={name}
        type={type}
        placeholder={placeholder}
        className={INPUT_BASE_CLASS}
      />
      {touched && error && (
        <p className="text-xs text-red-500 ml-2 mt-2">{error}</p>
      )}
    </div>
  );
}
